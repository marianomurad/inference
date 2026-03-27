package handler

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/middleware"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
)

type OrderHandler struct {
	svc service.OrderService
}

func NewOrderHandler(svc service.OrderService) *OrderHandler {
	return &OrderHandler{svc: svc}
}

func (h *OrderHandler) List(c *fiber.Ctx) error {
	filters := repository.OrderFilters{}

	if tableIDStr := c.Query("table_id"); tableIDStr != "" {
		id, err := uuid.Parse(tableIDStr)
		if err == nil {
			filters.TableID = &id
		}
	}
	if statusStr := c.Query("status"); statusStr != "" {
		s := domain.OrderStatus(statusStr)
		filters.Status = &s
	}

	orders, err := h.svc.ListOrders(filters)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(orders)
}

func (h *OrderHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid order id", nil)
	}
	order, err := h.svc.GetOrder(id)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "order not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(order)
}

func (h *OrderHandler) Create(c *fiber.Ctx) error {
	var input service.CreateOrderInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}

	user := middleware.CurrentUser(c)
	if user != nil && input.WaiterID == uuid.Nil {
		input.WaiterID = user.ID
	}

	order, err := h.svc.CreateOrder(input)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.Status(fiber.StatusCreated).JSON(order)
}

func (h *OrderHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid order id", nil)
	}
	var input service.CreateOrderInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	order, err := h.svc.UpdateOrder(id, input)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "order not found", nil)
	}
	if errors.Is(err, service.ErrOrderClosed) {
		return errorResponse(c, fiber.StatusConflict, "ORDER_CLOSED", "order is already closed", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(order)
}

func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid order id", nil)
	}
	var body struct {
		Status domain.OrderStatus `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil || body.Status == "" {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "status is required", nil)
	}
	if err := h.svc.UpdateOrderStatus(id, body.Status); errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "order not found", nil)
	} else if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *OrderHandler) AddItem(c *fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid order id", nil)
	}
	var input service.AddOrderItemInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	item, err := h.svc.AddItem(orderID, input)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "order not found", nil)
	}
	if errors.Is(err, service.ErrOrderClosed) {
		return errorResponse(c, fiber.StatusConflict, "ORDER_CLOSED", "order is already closed", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.Status(fiber.StatusCreated).JSON(item)
}

func (h *OrderHandler) RemoveItem(c *fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid order id", nil)
	}
	itemID, err := uuid.Parse(c.Params("itemId"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid item id", nil)
	}
	if err := h.svc.RemoveItem(orderID, itemID); errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "order not found", nil)
	} else if errors.Is(err, service.ErrOrderClosed) {
		return errorResponse(c, fiber.StatusConflict, "ORDER_CLOSED", "order is already closed", nil)
	} else if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.SendStatus(fiber.StatusNoContent)
}
