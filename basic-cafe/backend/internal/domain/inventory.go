package domain

import (
	"time"

	"github.com/google/uuid"
)

type InventoryItem struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name         string                                `json:"name"`
	Unit         string                                `json:"unit"`
	CurrentStock float64                               `json:"currentStock"`
	MinStock     float64                               `json:"minStock"`
	CreatedAt    time.Time                             `json:"createdAt"`
}

type StockEntry struct {
	ID              uuid.UUID     `gorm:"type:uuid;primaryKey" json:"id"`
	InventoryItemID uuid.UUID                                  `json:"inventoryItemId"`
	InventoryItem   InventoryItem                              `json:"inventoryItem"`
	Quantity        float64                                    `json:"quantity"`
	CostPerUnit     int64                                      `json:"costPerUnit"`
	Supplier        string                                     `json:"supplier"`
	ReceivedBy      uuid.UUID                                  `json:"receivedBy"`
	ReceivedAt      time.Time                                  `json:"receivedAt"`
}
