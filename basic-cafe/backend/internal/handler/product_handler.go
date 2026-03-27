package handler

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
)

type ProductHandler struct {
	svc service.ProductService
}

func NewProductHandler(svc service.ProductService) *ProductHandler {
	return &ProductHandler{svc: svc}
}

func (h *ProductHandler) List(c *fiber.Ctx) error {
	activeOnly := c.QueryBool("active", false)
	products, err := h.svc.ListProducts(activeOnly)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(products)
}

func (h *ProductHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid product id", nil)
	}
	product, err := h.svc.GetProduct(id)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "product not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(product)
}

func (h *ProductHandler) Create(c *fiber.Ctx) error {
	var input service.CreateProductInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	product, err := h.svc.CreateProduct(input)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.Status(fiber.StatusCreated).JSON(product)
}

func (h *ProductHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid product id", nil)
	}
	var input service.CreateProductInput
	if err := c.BodyParser(&input); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	product, err := h.svc.UpdateProduct(id, input)
	if errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "product not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(product)
}

func (h *ProductHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid product id", nil)
	}
	if err := h.svc.DeleteProduct(id); errors.Is(err, service.ErrNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "product not found", nil)
	} else if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductHandler) ListCategories(c *fiber.Ctx) error {
	cats, err := h.svc.ListCategories()
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(cats)
}

func (h *ProductHandler) CreateCategory(c *fiber.Ctx) error {
	var body struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&body); err != nil || body.Name == "" {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "name is required", nil)
	}
	cat, err := h.svc.CreateCategory(body.Name)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.Status(fiber.StatusCreated).JSON(cat)
}
