package handler

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/middleware"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
)

type AuthHandler struct {
	authSvc service.AuthService
}

func NewAuthHandler(authSvc service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}

	tokens, err := h.authSvc.Login(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			return errorResponse(c, fiber.StatusUnauthorized, "INVALID_CREDENTIALS", "invalid email or password", nil)
		}
		if errors.Is(err, service.ErrUserInactive) {
			return errorResponse(c, fiber.StatusForbidden, "USER_INACTIVE", "user account is inactive", nil)
		}
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", "login failed", nil)
	}

	return c.JSON(tokens)
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var req refreshRequest
	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "invalid request body", nil)
	}

	tokens, err := h.authSvc.Refresh(req.RefreshToken)
	if err != nil {
		return errorResponse(c, fiber.StatusUnauthorized, "INVALID_TOKEN", "invalid or expired refresh token", nil)
	}

	return c.JSON(tokens)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	user := middleware.CurrentUser(c)
	if user == nil {
		return errorResponse(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "not authenticated", nil)
	}

	if err := h.authSvc.Logout(user.ID); err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", "logout failed", nil)
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	user := middleware.CurrentUser(c)
	if user == nil {
		return errorResponse(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "not authenticated", nil)
	}
	return c.JSON(user)
}

func errorResponse(c *fiber.Ctx, status int, code, message string, details interface{}) error {
	return c.Status(status).JSON(fiber.Map{
		"error": fiber.Map{
			"code":    code,
			"message": message,
			"details": details,
		},
	})
}
