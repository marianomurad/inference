package handler

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ReportHandler struct {
	db *gorm.DB
}

func NewReportHandler(db *gorm.DB) *ReportHandler {
	return &ReportHandler{db: db}
}

type SalesSummary struct {
	TotalOrders  int64 `json:"total_orders"`
	TotalRevenue int64 `json:"total_revenue"`
}

type TopProduct struct {
	ProductID   string `json:"product_id"`
	ProductName string `json:"product_name"`
	TotalSold   int64  `json:"total_sold"`
	TotalRev    int64  `json:"total_revenue"`
}

type InventoryUsage struct {
	ItemID      string  `json:"item_id"`
	ItemName    string  `json:"item_name"`
	TotalIn     float64 `json:"total_in"`
}

func (h *ReportHandler) Sales(c *fiber.Ctx) error {
	from, to := parseDateRange(c)

	var result SalesSummary
	err := h.db.Raw(`
		SELECT COUNT(DISTINCT o.id) as total_orders,
		       COALESCE(SUM(p.amount), 0) as total_revenue
		FROM orders o
		JOIN payments p ON p.order_id = o.id AND p.status = 'completed'
		WHERE o.opened_at >= ? AND o.opened_at <= ?
	`, from, to).Scan(&result).Error
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(result)
}

func (h *ReportHandler) TopProducts(c *fiber.Ctx) error {
	from, to := parseDateRange(c)
	limit := c.QueryInt("limit", 10)

	var results []TopProduct
	err := h.db.Raw(`
		SELECT oi.product_id::text,
		       pr.name as product_name,
		       SUM(oi.quantity) as total_sold,
		       SUM(oi.quantity * oi.unit_price) as total_rev
		FROM order_items oi
		JOIN orders o ON o.id = oi.order_id
		JOIN products pr ON pr.id = oi.product_id
		WHERE o.opened_at >= ? AND o.opened_at <= ?
		GROUP BY oi.product_id, pr.name
		ORDER BY total_sold DESC
		LIMIT ?
	`, from, to, limit).Scan(&results).Error
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(results)
}

func (h *ReportHandler) InventoryUsage(c *fiber.Ctx) error {
	from, to := parseDateRange(c)

	var results []InventoryUsage
	err := h.db.Raw(`
		SELECT se.inventory_item_id::text as item_id,
		       ii.name as item_name,
		       SUM(se.quantity) as total_in
		FROM stock_entries se
		JOIN inventory_items ii ON ii.id = se.inventory_item_id
		WHERE se.received_at >= ? AND se.received_at <= ?
		GROUP BY se.inventory_item_id, ii.name
		ORDER BY total_in DESC
	`, from, to).Scan(&results).Error
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
	}
	return c.JSON(results)
}

func parseDateRange(c *fiber.Ctx) (time.Time, time.Time) {
	now := time.Now().UTC()
	from := now.AddDate(0, -1, 0)
	to := now

	if fromStr := c.Query("from"); fromStr != "" {
		if t, err := time.Parse(time.RFC3339, fromStr); err == nil {
			from = t
		}
	}
	if toStr := c.Query("to"); toStr != "" {
		if t, err := time.Parse(time.RFC3339, toStr); err == nil {
			to = t
		}
	}
	return from, to
}
