package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/handler"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/hub"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/middleware"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
)

type Handlers struct {
	Auth      *handler.AuthHandler
	User      *handler.UserHandler
	Product   *handler.ProductHandler
	Inventory *handler.InventoryHandler
	Table     *handler.TableHandler
	Order     *handler.OrderHandler
	Checkout  *handler.CheckoutHandler
	Report    *handler.ReportHandler
	Hub       *hub.Hub
	AuthSvc   service.AuthService
}

func Setup(app *fiber.App, h Handlers) {
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	v1 := app.Group("/api/v1")

	// Auth routes
	auth := v1.Group("/auth")
	auth.Post("/login", h.Auth.Login)
	auth.Post("/refresh", h.Auth.Refresh)
	auth.Post("/logout", middleware.Auth(h.AuthSvc), h.Auth.Logout)
	auth.Get("/me", middleware.Auth(h.AuthSvc), h.Auth.Me)

	// Protected routes base
	protected := v1.Group("", middleware.Auth(h.AuthSvc))

	// Users (owner/manager only)
	users := protected.Group("/users", middleware.RequireRoles(middleware.OwnerManagerRoles...))
	users.Get("/", h.User.List)
	users.Post("/", h.User.Create)
	users.Get("/:id", h.User.Get)
	users.Put("/:id", h.User.Update)
	users.Delete("/:id", h.User.Delete)

	// Products
	products := protected.Group("/products")
	products.Get("/", h.Product.List)
	products.Get("/:id", h.Product.Get)
	products.Post("/", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Product.Create)
	products.Put("/:id", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Product.Update)
	products.Delete("/:id", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Product.Delete)

	// Categories
	categories := protected.Group("/categories")
	categories.Get("/", h.Product.ListCategories)
	categories.Post("/", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Product.CreateCategory)

	// Inventory
	inventory := protected.Group("/inventory")
	inventory.Get("/", h.Inventory.List)
	// Note: low-stock must be registered before /:id to avoid conflict
	inventory.Get("/low-stock", h.Inventory.LowStock)
	inventory.Get("/:id", h.Inventory.Get)
	inventory.Post("/", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Inventory.Create)
	inventory.Put("/:id", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Inventory.Update)
	inventory.Post("/:id/entries", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Inventory.AddStockEntry)
	inventory.Get("/:id/entries", h.Inventory.ListEntries)

	// Tables
	tables := protected.Group("/tables")
	tables.Get("/", h.Table.List)
	tables.Get("/:id", h.Table.Get)
	tables.Post("/", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Table.Create)
	tables.Put("/:id", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Table.Update)
	tables.Patch("/:id/status", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Table.UpdateStatus)
	tables.Delete("/:id", middleware.RequireRoles(middleware.OwnerManagerRoles...), h.Table.Delete)

	// Orders
	orders := protected.Group("/orders")
	orders.Get("/", h.Order.List)
	orders.Get("/:id", h.Order.Get)
	orders.Post("/", middleware.RequireRoles(middleware.OrderModifyRoles...), h.Order.Create)
	orders.Put("/:id", middleware.RequireRoles(middleware.OrderModifyRoles...), h.Order.Update)
	orders.Patch("/:id/status", middleware.RequireRoles(middleware.OrderModifyRoles...), h.Order.UpdateStatus)
	orders.Post("/:id/items", middleware.RequireRoles(middleware.OrderModifyRoles...), h.Order.AddItem)
	orders.Delete("/:id/items/:itemId", middleware.RequireRoles(middleware.OrderModifyRoles...), h.Order.RemoveItem)

	// Checkout
	orders.Get("/:id/checkout", middleware.RequireRoles(middleware.CheckoutRoles...), h.Checkout.GetSummary)
	orders.Post("/:id/checkout", middleware.RequireRoles(middleware.CheckoutRoles...), h.Checkout.Checkout)
	orders.Post("/:id/confirm", middleware.RequireRoles(middleware.CheckoutRoles...), h.Checkout.ConfirmPayment)

	payments := protected.Group("/payments")
	payments.Post("/:id/refund", middleware.RequireRoles(middleware.CheckoutRoles...), h.Checkout.Refund)
	payments.Get("/webhook", h.Checkout.Webhook)

	// Reports
	reports := protected.Group("/reports", middleware.RequireRoles(middleware.OwnerManagerRoles...))
	reports.Get("/sales", h.Report.Sales)
	reports.Get("/top-products", h.Report.TopProducts)
	reports.Get("/inventory-usage", h.Report.InventoryUsage)

	// WebSocket
	v1.Get("/ws", handler.WSUpgradeMiddleware(), handler.NewWSHandler(h.Hub))
}
