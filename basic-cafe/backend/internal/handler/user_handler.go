package handler

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserHandler struct {
	userRepo repository.UserRepository
}

func NewUserHandler(userRepo repository.UserRepository) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

type createUserRequest struct {
	Name     string      `json:"name"`
	Email    string      `json:"email"`
	Password string      `json:"password"`
	Role     domain.Role `json:"role"`
}

func (h *UserHandler) List(c *fiber.Ctx) error {
	users, err := h.userRepo.FindAll()
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(users)
}

func (h *UserHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid user id", nil)
	}
	user, err := h.userRepo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "user not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(user)
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	var req createUserRequest
	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "name, email, and password are required", nil)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", "failed to hash password", nil)
	}

	user := &domain.User{
		ID:           uuid.New(),
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hash),
		Role:         req.Role,
		Active:       true,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}

	if err := h.userRepo.Create(user); err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	user.PasswordHash = ""
	return c.Status(fiber.StatusCreated).JSON(user)
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid user id", nil)
	}

	user, err := h.userRepo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "user not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}

	var req struct {
		Name   string      `json:"name"`
		Email  string      `json:"email"`
		Role   domain.Role `json:"role"`
		Active *bool       `json:"active"`
	}
	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.Active != nil {
		user.Active = *req.Active
	}
	user.UpdatedAt = time.Now().UTC()

	if err := h.userRepo.Update(user); err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	user.PasswordHash = ""
	return c.JSON(user)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "INVALID_ID", "invalid user id", nil)
	}

	_, err = h.userRepo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return errorResponse(c, fiber.StatusNotFound, "NOT_FOUND", "user not found", nil)
	}
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}

	if err := h.userRepo.Delete(id); err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.SendStatus(fiber.StatusNoContent)
}

