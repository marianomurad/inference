package domain

import "github.com/google/uuid"

type TableStatus string

const (
	TableAvailable TableStatus = "available"
	TableOccupied  TableStatus = "occupied"
	TableReserved  TableStatus = "reserved"
	TableCleaning  TableStatus = "cleaning"
)

type Table struct {
	ID       uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	Number   int         `gorm:"uniqueIndex"          json:"number"`
	Capacity int                                      `json:"capacity"`
	Status   TableStatus `gorm:"default:'available'"  json:"status"`
	PosX     float64                                  `json:"posX"`
	PosY     float64                                  `json:"posY"`
}
