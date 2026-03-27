package domain

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name string    `gorm:"uniqueIndex"          json:"name"`
}

type Product struct {
	ID          uuid.UUID        `gorm:"type:uuid;primaryKey" json:"id"`
	CategoryID  uuid.UUID                                     `json:"categoryId"`
	Category    Category                                      `json:"category"`
	Name        string                                        `json:"name"`
	Description string                                        `json:"description"`
	BasePrice   int64                                         `json:"basePrice"`
	ImageURL    string                                        `json:"imageUrl"`
	Active      bool             `gorm:"default:true"         json:"active"`
	Variants    []ProductVariant                              `json:"variants"`
	CreatedAt   time.Time                                     `json:"createdAt"`
	UpdatedAt   time.Time                                     `json:"updatedAt"`
}

type ProductVariant struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	ProductID uuid.UUID                                `json:"productId"`
	Name      string                                   `json:"name"`
	PriceDiff int64                                    `json:"priceDiff"`
}
