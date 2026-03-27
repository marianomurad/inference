package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
)

// RequireRoles returns middleware that checks the current user has one of the given roles.
func RequireRoles(roles ...domain.Role) fiber.Handler {
	allowed := make(map[domain.Role]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}

	return func(c *fiber.Ctx) error {
		user := CurrentUser(c)
		if user == nil {
			return respondError(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "not authenticated", nil)
		}
		if _, ok := allowed[user.Role]; !ok {
			return respondError(c, fiber.StatusForbidden, "FORBIDDEN", "insufficient permissions", nil)
		}
		return c.Next()
	}
}

var (
	// Convenience role sets
	OwnerManagerRoles   = []domain.Role{domain.RoleOwner, domain.RoleManager}
	AllStaffRoles       = []domain.Role{domain.RoleOwner, domain.RoleManager, domain.RoleCashier, domain.RoleWaiter}
	CheckoutRoles       = []domain.Role{domain.RoleOwner, domain.RoleManager, domain.RoleCashier}
	OrderModifyRoles    = []domain.Role{domain.RoleOwner, domain.RoleManager, domain.RoleCashier, domain.RoleWaiter}
)
