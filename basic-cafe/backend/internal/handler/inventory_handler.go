package handler

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/middleware"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
)

type InventoryHandler struct {
	svc service.InventoryService
}

func NewInventoryHandler(svc service.InventoryService) *InventoryHandler {
	return &InventoryHandler{svc: svc}
}

func (h *InventoryHandler) List(c *fiber.Ctx) error {
	items, err := h.svc.ListItems()
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(items)
}

func (h *InventoryHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid inventory item id", nil)
	}
	item, err := h.svc.GetItem(id)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "inventory item not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(item)
}

func (h *InventoryHandler) Create(c *fiber.Ctx) error {
	var input service.CreateInventoryItemInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	item, err := h.svc.CreateItem(input)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.Status(fiber.StatusCreated).JSON(item)
}

func (h *InventoryHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid inventory item id", nil)
	}
	var input service.CreateInventoryItemInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	item, err := h.svc.UpdateItem(id, input)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "inventory item not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(item)
}

func (h *InventoryHandler) LowStock(c *fiber.Ctx) error {
	items, err := h.svc.GetLowStock()
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(items)
}

func (h *InventoryHandler) AddStockEntry(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid inventory item id", nil)
	}

	var input service.CreateStockEntryInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}

	user := middleware.CurrentUser(c)
	if input.ReceivedBy == uuid.Nil && user != nil {
		input.ReceivedBy = user.ID
	}

	entry, err := h.svc.AddStockEntry(id, input)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "inventory item not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.Status(fiber.StatusCreated).JSON(entry)
}

func (h *InventoryHandler) ListEntries(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid inventory item id", nil)
	}
	entries, err := h.svc.ListStockEntries(id)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "inventory item not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(entries)
}
