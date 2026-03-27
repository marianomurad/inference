package payment

import (
	"errors"

	"github.com/gofiber/fiber/v2"
)

type MercadoPagoProvider struct {
	AccessToken string
}

func NewMercadoPagoProvider(accessToken string) Provider {
	return &MercadoPagoProvider{AccessToken: accessToken}
}

func (m *MercadoPagoProvider) CreateIntent(amount int64, currency string, meta PaymentMeta) (*PaymentIntent, error) {
	return nil, errors.New("mercadopago: not implemented")
}

func (m *MercadoPagoProvider) ConfirmPayment(intentID string) (*PaymentResult, error) {
	return nil, errors.New("mercadopago: not implemented")
}

func (m *MercadoPagoProvider) Refund(intentID string, amount int64) (*RefundResult, error) {
	return nil, errors.New("mercadopago: not implemented")
}

func (m *MercadoPagoProvider) WebhookHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return fiber.ErrNotImplemented
	}
}
