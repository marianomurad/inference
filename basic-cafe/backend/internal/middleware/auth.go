package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
)

const UserContextKey = "user"

func Auth(authSvc service.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return respondError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "missing authorization header", nil)
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return respondError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "invalid authorization header format", nil)
		}

		user, err := authSvc.ValidateAccessToken(parts[1])
		if err != nil {
			return respondError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "invalid or expired token", nil)
		}

		if !user.Active {
			return respondError(c, fiber.StatusForbidden, "FORBIDDEN", "user is inactive", nil)
		}

		c.Locals(UserContextKey, user)
		return c.Next()
	}
}

func CurrentUser(c *fiber.Ctx) *domain.User {
	u, _ := c.Locals(UserContextKey).(*domain.User)
	return u
}

func respondError(c *fiber.Ctx, status int, code, message string, details interface{}) error {
	return c.Status(status).JSON(fiber.Map{
		"error": fiber.Map{
			"code":    code,
			"message": message,
			"details": details,
		},
	})
}
