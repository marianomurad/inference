package domain

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleOwner   Role = "owner"
	RoleManager Role = "manager"
	RoleCashier Role = "cashier"
	RoleWaiter  Role = "waiter"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name         string                                `json:"name"`
	Email        string    `gorm:"uniqueIndex"          json:"email"`
	PasswordHash string                                `json:"-"`
	Role         Role                                  `json:"role"`
	Active       bool      `gorm:"default:true"         json:"active"`
	CreatedAt    time.Time                             `json:"createdAt"`
	UpdatedAt    time.Time                             `json:"updatedAt"`
}
