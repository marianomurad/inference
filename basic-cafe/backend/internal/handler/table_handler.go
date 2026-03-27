package handler

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
)

type TableHandler struct {
	svc service.TableService
}

func NewTableHandler(svc service.TableService) *TableHandler {
	return &TableHandler{svc: svc}
}

func (h *TableHandler) List(c *fiber.Ctx) error {
	tables, err := h.svc.ListTables()
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(tables)
}

func (h *TableHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid table id", nil)
	}
	table, err := h.svc.GetTable(id)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "table not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(table)
}

func (h *TableHandler) Create(c *fiber.Ctx) error {
	var input service.CreateTableInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	table, err := h.svc.CreateTable(input)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.Status(fiber.StatusCreated).JSON(table)
}

func (h *TableHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid table id", nil)
	}
	var input service.CreateTableInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	table, err := h.svc.UpdateTable(id, input)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "table not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(table)
}

func (h *TableHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid table id", nil)
	}
	var body struct {
		Status domain.TableStatus `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil || body.Status == "" {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "status is required", nil)
	}
	if err := h.svc.UpdateTableStatus(id, body.Status); errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "table not found", nil)
	} else if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *TableHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid table id", nil)
	}
	if err := h.svc.DeleteTable(id); errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "table not found", nil)
	} else if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.SendStatus(fiber.StatusNoContent)
}
