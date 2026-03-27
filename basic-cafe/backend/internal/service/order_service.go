package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/hub"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"gorm.io/gorm"
)

var ErrOrderClosed = errors.New("order is already closed")

type CreateOrderInput struct {
	TableID  *uuid.UUID
	WaiterID uuid.UUID `validate:"required"`
	Notes    string
}

type AddOrderItemInput struct {
	ProductID uuid.UUID  `validate:"required"`
	VariantID *uuid.UUID
	Quantity  int        `validate:"required,gt=0"`
	UnitPrice int64      `validate:"gte=0"`
	Notes     string
}

type OrderService interface {
	ListOrders(filters repository.OrderFilters) ([]domain.Order, error)
	GetOrder(id uuid.UUID) (*domain.Order, error)
	CreateOrder(input CreateOrderInput) (*domain.Order, error)
	UpdateOrder(id uuid.UUID, input CreateOrderInput) (*domain.Order, error)
	UpdateOrderStatus(id uuid.UUID, status domain.OrderStatus) error

	AddItem(orderID uuid.UUID, input AddOrderItemInput) (*domain.OrderItem, error)
	RemoveItem(orderID, itemID uuid.UUID) error
}

type orderService struct {
	repo        repository.OrderRepository
	productRepo repository.ProductRepository
	hub         *hub.Hub
}

func NewOrderService(repo repository.OrderRepository, productRepo repository.ProductRepository, h *hub.Hub) OrderService {
	return &orderService{repo: repo, productRepo: productRepo, hub: h}
}

func (s *orderService) ListOrders(filters repository.OrderFilters) ([]domain.Order, error) {
	return s.repo.FindAll(filters)
}

func (s *orderService) GetOrder(id uuid.UUID) (*domain.Order, error) {
	order, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return order, err
}

func (s *orderService) CreateOrder(input CreateOrderInput) (*domain.Order, error) {
	order := &domain.Order{
		ID:       uuid.New(),
		TableID:  input.TableID,
		WaiterID: input.WaiterID,
		Status:   domain.OrderOpen,
		Notes:    input.Notes,
		OpenedAt: time.Now().UTC(),
	}

	if err := s.repo.Create(order); err != nil {
		return nil, err
	}

	evt := map[string]interface{}{"orderId": order.ID}
	if input.TableID != nil {
		evt["tableId"] = *input.TableID
	}
	s.hub.Broadcast(hub.Event{Event: "order.created", Data: evt})

	return s.repo.FindByID(order.ID)
}

func (s *orderService) UpdateOrder(id uuid.UUID, input CreateOrderInput) (*domain.Order, error) {
	order, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if order.Status == domain.OrderPaid || order.Status == domain.OrderCancelled {
		return nil, ErrOrderClosed
	}

	order.TableID = input.TableID
	order.Notes = input.Notes

	if err := s.repo.Update(order); err != nil {
		return nil, err
	}
	return s.repo.FindByID(order.ID)
}

func (s *orderService) UpdateOrderStatus(id uuid.UUID, status domain.OrderStatus) error {
	order, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}

	if err := s.repo.UpdateStatus(id, status); err != nil {
		return err
	}

	evt := map[string]interface{}{"orderId": order.ID, "status": status}
	s.hub.Broadcast(hub.Event{Event: "order.status_changed", Data: evt})
	return nil
}

func (s *orderService) AddItem(orderID uuid.UUID, input AddOrderItemInput) (*domain.OrderItem, error) {
	order, err := s.repo.FindByID(orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if order.Status == domain.OrderPaid || order.Status == domain.OrderCancelled {
		return nil, ErrOrderClosed
	}

	item := &domain.OrderItem{
		ID:        uuid.New(),
		OrderID:   orderID,
		ProductID: input.ProductID,
		VariantID: input.VariantID,
		Quantity:  input.Quantity,
		UnitPrice: input.UnitPrice,
		Notes:     input.Notes,
	}

	if err := s.repo.AddItem(item); err != nil {
		return nil, err
	}

	fullItem, err := s.repo.FindItemByID(item.ID)
	if err != nil {
		return nil, err
	}

	s.hub.Broadcast(hub.Event{
		Event: "order.item_added",
		Data: map[string]interface{}{
			"orderId": orderID,
			"item":    fullItem,
		},
	})

	return fullItem, nil
}

func (s *orderService) RemoveItem(orderID, itemID uuid.UUID) error {
	order, err := s.repo.FindByID(orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}

	if order.Status == domain.OrderPaid || order.Status == domain.OrderCancelled {
		return ErrOrderClosed
	}

	return s.repo.RemoveItem(orderID, itemID)
}
