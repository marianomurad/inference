package payment

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

type PaymentMeta struct {
	OrderID     string
	Description string
	CustomerRef string
}

type PaymentIntent struct {
	ID          string
	ClientToken string
	Amount      int64
	Currency    string
}

type PaymentResult struct {
	IntentID string
	Status   string
	PaidAt   time.Time
}

type RefundResult struct {
	RefundID string
	Amount   int64
	Status   string
}

type Provider interface {
	CreateIntent(amount int64, currency string, meta PaymentMeta) (*PaymentIntent, error)
	ConfirmPayment(intentID string) (*PaymentResult, error)
	Refund(intentID string, amount int64) (*RefundResult, error)
	WebhookHandler() fiber.Handler
}
