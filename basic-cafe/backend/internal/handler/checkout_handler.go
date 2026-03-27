package handler

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
)

type CheckoutHandler struct {
	svc             service.CheckoutService
	webhookProvider interface{ WebhookHandler() fiber.Handler }
}

func NewCheckoutHandler(svc service.CheckoutService) *CheckoutHandler {
	return &CheckoutHandler{svc: svc}
}

func (h *CheckoutHandler) GetSummary(c *fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid order id", nil)
	}
	summary, err := h.svc.GetSummary(orderID)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "order not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(summary)
}

func (h *CheckoutHandler) Checkout(c *fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid order id", nil)
	}

	var input service.CheckoutInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	if input.Currency == "" {
		input.Currency = "USD"
	}

	payment, err := h.svc.Checkout(orderID, input)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "order not found", nil)
	}
	if errors.Is(err, service.ErrOrderNotCheckable) {
		return errorResponse(c, fiber.StatusConflict, "ORDER_NOT_CHECKABLE", "order cannot be checked out in its current state", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.Status(fiber.StatusCreated).JSON(payment)
}

func (h *CheckoutHandler) ConfirmPayment(c *fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid order id", nil)
	}

	var body struct {
		Method string `json:"method"`
	}
	if err := c.BodyParser(&body); err != nil || body.Method == "" {
		body.Method = "cash"
	}

	payment, err := h.svc.ProcessPayment(orderID, body.Method)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "order not found", nil)
	}
	if errors.Is(err, service.ErrOrderNotCheckable) {
		return errorResponse(c, fiber.StatusConflict, "ORDER_NOT_CHECKABLE", "order cannot be checked out in its current state", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(payment)
}

func (h *CheckoutHandler) Refund(c *fiber.Ctx) error {
	paymentID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid payment id", nil)
	}
	payment, err := h.svc.Refund(paymentID)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "payment not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(payment)
}

func (h *CheckoutHandler) Webhook(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "ok"})
}
