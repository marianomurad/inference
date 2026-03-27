package domain

import (
	"time"

	"github.com/google/uuid"
)

type PaymentStatus string

const (
	PaymentPending   PaymentStatus = "pending"
	PaymentCompleted PaymentStatus = "completed"
	PaymentFailed    PaymentStatus = "failed"
	PaymentRefunded  PaymentStatus = "refunded"
)

type Payment struct {
	ID          uuid.UUID     `gorm:"type:uuid;primaryKey" json:"id"`
	OrderID     uuid.UUID                                  `json:"orderId"`
	Amount      int64                                      `json:"amount"`
	Method      string                                     `json:"method"`
	Provider    string                                     `json:"provider"`
	ProviderRef string                                     `json:"providerRef"`
	Status      PaymentStatus `gorm:"default:'pending'"    json:"status"`
	CreatedAt   time.Time                                  `json:"createdAt"`
	UpdatedAt   time.Time                                  `json:"updatedAt"`
}
