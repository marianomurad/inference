package payment

import (
	"errors"

	"github.com/gofiber/fiber/v2"
)

type StripeProvider struct {
	SecretKey     string
	WebhookSecret string
}

func NewStripeProvider(secretKey, webhookSecret string) Provider {
	return &StripeProvider{
		SecretKey:     secretKey,
		WebhookSecret: webhookSecret,
	}
}

func (s *StripeProvider) CreateIntent(amount int64, currency string, meta PaymentMeta) (*PaymentIntent, error) {
	return nil, errors.New("stripe: not implemented")
}

func (s *StripeProvider) ConfirmPayment(intentID string) (*PaymentResult, error) {
	return nil, errors.New("stripe: not implemented")
}

func (s *StripeProvider) Refund(intentID string, amount int64) (*RefundResult, error) {
	return nil, errors.New("stripe: not implemented")
}

func (s *StripeProvider) WebhookHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return fiber.ErrNotImplemented
	}
}
