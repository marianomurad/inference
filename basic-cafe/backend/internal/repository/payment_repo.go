package repository

import (
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"gorm.io/gorm"
)

type PaymentRepository interface {
	FindByID(id uuid.UUID) (*domain.Payment, error)
	FindByOrderID(orderID uuid.UUID) (*domain.Payment, error)
	Create(payment *domain.Payment) error
	Update(payment *domain.Payment) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *paymentRepository) FindByID(id uuid.UUID) (*domain.Payment, error) {
	var payment domain.Payment
	err := r.db.First(&payment, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

func (r *paymentRepository) FindByOrderID(orderID uuid.UUID) (*domain.Payment, error) {
	var payment domain.Payment
	err := r.db.First(&payment, "order_id = ?", orderID).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

func (r *paymentRepository) Create(payment *domain.Payment) error {
	return r.db.Create(payment).Error
}

func (r *paymentRepository) Update(payment *domain.Payment) error {
	return r.db.Save(payment).Error
}
