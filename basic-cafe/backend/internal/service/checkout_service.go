package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/hub"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/payment"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrOrderNotCheckable = errors.New("order is not in a checkable state")
	ErrPaymentNotPending = errors.New("payment is not in pending state")
)

type CheckoutInput struct {
	Method   string `validate:"required"`
	Currency string `validate:"required"`
}

type CheckoutSummaryItem struct {
	Name      string `json:"name"`
	Quantity  int    `json:"quantity"`
	UnitPrice int64  `json:"unitPrice"`
	Total     int64  `json:"total"`
}

type CheckoutSummary struct {
	OrderID  uuid.UUID            `json:"orderId"`
	Items    []CheckoutSummaryItem `json:"items"`
	Subtotal int64                 `json:"subtotal"`
	Tax      int64                 `json:"tax"`
	Discount int64                 `json:"discount"`
	Total    int64                 `json:"total"`
}

type CheckoutService interface {
	GetSummary(orderID uuid.UUID) (*CheckoutSummary, error)
	ProcessPayment(orderID uuid.UUID, method string) (*domain.Payment, error)
	Checkout(orderID uuid.UUID, input CheckoutInput) (*domain.Payment, error)
	ConfirmPayment(paymentID uuid.UUID) (*domain.Payment, error)
	Refund(paymentID uuid.UUID) (*domain.Payment, error)
}

type checkoutService struct {
	orderRepo   repository.OrderRepository
	paymentRepo repository.PaymentRepository
	provider    payment.Provider
	hub         *hub.Hub
}

func NewCheckoutService(
	orderRepo repository.OrderRepository,
	paymentRepo repository.PaymentRepository,
	provider payment.Provider,
	h *hub.Hub,
) CheckoutService {
	return &checkoutService{
		orderRepo:   orderRepo,
		paymentRepo: paymentRepo,
		provider:    provider,
		hub:         h,
	}
}

func (s *checkoutService) GetSummary(orderID uuid.UUID) (*CheckoutSummary, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	var subtotal int64
	items := make([]CheckoutSummaryItem, 0, len(order.Items))
	for _, item := range order.Items {
		lineTotal := item.UnitPrice * int64(item.Quantity)
		subtotal += lineTotal
		items = append(items, CheckoutSummaryItem{
			Name:      item.Product.Name,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
			Total:     lineTotal,
		})
	}

	tax := subtotal / 10 // 10% tax
	return &CheckoutSummary{
		OrderID:  orderID,
		Items:    items,
		Subtotal: subtotal,
		Tax:      tax,
		Discount: 0,
		Total:    subtotal + tax,
	}, nil
}

func (s *checkoutService) ProcessPayment(orderID uuid.UUID, method string) (*domain.Payment, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if order.Status != domain.OrderOpen && order.Status != domain.OrderDelivered {
		return nil, ErrOrderNotCheckable
	}

	var subtotal int64
	for _, item := range order.Items {
		subtotal += item.UnitPrice * int64(item.Quantity)
	}
	total := subtotal + subtotal/10

	meta := payment.PaymentMeta{
		OrderID:     orderID.String(),
		Description: "Order payment",
	}
	intent, err := s.provider.CreateIntent(total, "USD", meta)
	if err != nil {
		return nil, err
	}

	pmt := &domain.Payment{
		ID:          uuid.New(),
		OrderID:     orderID,
		Amount:      total,
		Method:      method,
		Provider:    intent.ID,
		ProviderRef: intent.ID,
		Status:      domain.PaymentPending,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	if err := s.paymentRepo.Create(pmt); err != nil {
		return nil, err
	}

	result, err := s.provider.ConfirmPayment(pmt.ProviderRef)
	if err != nil {
		pmt.Status = domain.PaymentFailed
		pmt.UpdatedAt = time.Now().UTC()
		_ = s.paymentRepo.Update(pmt)
		return nil, err
	}

	pmt.Status = domain.PaymentCompleted
	pmt.UpdatedAt = result.PaidAt
	if err := s.paymentRepo.Update(pmt); err != nil {
		return nil, err
	}

	if err := s.orderRepo.UpdateStatus(orderID, domain.OrderPaid); err != nil {
		return nil, err
	}

	evt := map[string]interface{}{"orderId": order.ID}
	if order.TableID != nil {
		evt["tableId"] = *order.TableID
	}
	s.hub.Broadcast(hub.Event{Event: "order.paid", Data: evt})
	if order.TableID != nil {
		s.hub.Broadcast(hub.Event{
			Event: "table.status_changed",
			Data:  map[string]interface{}{"tableId": *order.TableID, "status": domain.TableAvailable},
		})
	}

	return pmt, nil
}

func (s *checkoutService) Checkout(orderID uuid.UUID, input CheckoutInput) (*domain.Payment, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if order.Status != domain.OrderOpen && order.Status != domain.OrderDelivered {
		return nil, ErrOrderNotCheckable
	}

	var total int64
	for _, item := range order.Items {
		total += item.UnitPrice * int64(item.Quantity)
	}

	meta := payment.PaymentMeta{
		OrderID:     orderID.String(),
		Description: "Order payment",
	}

	intent, err := s.provider.CreateIntent(total, input.Currency, meta)
	if err != nil {
		return nil, err
	}

	pmt := &domain.Payment{
		ID:          uuid.New(),
		OrderID:     orderID,
		Amount:      total,
		Method:      input.Method,
		Provider:    intent.ID,
		ProviderRef: intent.ID,
		Status:      domain.PaymentPending,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}

	if err := s.paymentRepo.Create(pmt); err != nil {
		return nil, err
	}

	return pmt, nil
}

func (s *checkoutService) ConfirmPayment(paymentID uuid.UUID) (*domain.Payment, error) {
	pmt, err := s.paymentRepo.FindByID(paymentID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if pmt.Status != domain.PaymentPending {
		return nil, ErrPaymentNotPending
	}

	result, err := s.provider.ConfirmPayment(pmt.ProviderRef)
	if err != nil {
		pmt.Status = domain.PaymentFailed
		pmt.UpdatedAt = time.Now().UTC()
		_ = s.paymentRepo.Update(pmt)
		return nil, err
	}

	pmt.Status = domain.PaymentCompleted
	pmt.UpdatedAt = result.PaidAt

	if err := s.paymentRepo.Update(pmt); err != nil {
		return nil, err
	}

	// Update order status to paid
	if err := s.orderRepo.UpdateStatus(pmt.OrderID, domain.OrderPaid); err != nil {
		return nil, err
	}

	// Fetch order to get tableID for WS events
	order, err := s.orderRepo.FindByID(pmt.OrderID)
	if err == nil {
		evt := map[string]interface{}{"orderId": order.ID}
		if order.TableID != nil {
			evt["tableId"] = *order.TableID
		}
		s.hub.Broadcast(hub.Event{Event: "order.paid", Data: evt})

		if order.TableID != nil {
			s.hub.Broadcast(hub.Event{
				Event: "table.status_changed",
				Data: map[string]interface{}{
					"tableId": *order.TableID,
					"status":  domain.TableAvailable,
				},
			})
		}
	}

	return pmt, nil
}

func (s *checkoutService) Refund(paymentID uuid.UUID) (*domain.Payment, error) {
	pmt, err := s.paymentRepo.FindByID(paymentID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if pmt.Status != domain.PaymentCompleted {
		return nil, errors.New("payment is not completed, cannot refund")
	}

	_, err = s.provider.Refund(pmt.ProviderRef, pmt.Amount)
	if err != nil {
		return nil, err
	}

	pmt.Status = domain.PaymentRefunded
	pmt.UpdatedAt = time.Now().UTC()

	if err := s.paymentRepo.Update(pmt); err != nil {
		return nil, err
	}

	return pmt, nil
}
