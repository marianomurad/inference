package payment

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type MockProvider struct{}

func NewMockProvider() Provider {
	return &MockProvider{}
}

func (m *MockProvider) CreateIntent(amount int64, currency string, meta PaymentMeta) (*PaymentIntent, error) {
	id := uuid.New().String()
	return &PaymentIntent{
		ID:          fmt.Sprintf("mock_%s", id),
		ClientToken: fmt.Sprintf("mock_token_%s", id),
		Amount:      amount,
		Currency:    currency,
	}, nil
}

func (m *MockProvider) ConfirmPayment(intentID string) (*PaymentResult, error) {
	return &PaymentResult{
		IntentID: intentID,
		Status:   "completed",
		PaidAt:   time.Now().UTC(),
	}, nil
}

func (m *MockProvider) Refund(intentID string, amount int64) (*RefundResult, error) {
	return &RefundResult{
		RefundID: fmt.Sprintf("mock_refund_%s", uuid.New().String()),
		Amount:   amount,
		Status:   "refunded",
	}, nil
}

func (m *MockProvider) WebhookHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	}
}
