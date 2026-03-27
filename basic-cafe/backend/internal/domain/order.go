package domain

import (
	"time"

	"github.com/google/uuid"
)

type OrderStatus string

const (
	OrderOpen      OrderStatus = "open"
	OrderReady     OrderStatus = "ready"
	OrderDelivered OrderStatus = "delivered"
	OrderPaid      OrderStatus = "paid"
	OrderCancelled OrderStatus = "cancelled"
)

type Order struct {
	ID       uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	TableID  *uuid.UUID                                `json:"tableId"`
	Table    *Table                                    `json:"table"`
	WaiterID uuid.UUID                                 `json:"waiterId"`
	Status   OrderStatus `gorm:"default:'open'"       json:"status"`
	Items    []OrderItem                               `json:"items"`
	Notes    string                                    `json:"notes"`
	OpenedAt time.Time                                 `json:"openedAt"`
	ClosedAt *time.Time                                `json:"closedAt"`
}

type OrderItem struct {
	ID        uuid.UUID       `gorm:"type:uuid;primaryKey" json:"id"`
	OrderID   uuid.UUID                                    `json:"orderId"`
	ProductID uuid.UUID                                    `json:"productId"`
	Product   Product                                      `json:"product"`
	VariantID *uuid.UUID                                   `json:"variantId"`
	Variant   *ProductVariant                              `json:"variant"`
	Quantity  int                                          `json:"quantity"`
	UnitPrice int64                                        `json:"unitPrice"`
	Notes     string                                       `json:"notes"`
}
