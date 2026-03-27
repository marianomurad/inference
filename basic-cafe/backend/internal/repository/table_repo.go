package repository

import (
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"gorm.io/gorm"
)

type TableRepository interface {
	FindAll() ([]domain.Table, error)
	FindByID(id uuid.UUID) (*domain.Table, error)
	Create(table *domain.Table) error
	Update(table *domain.Table) error
	UpdateStatus(id uuid.UUID, status domain.TableStatus) error
	Delete(id uuid.UUID) error
}

type tableRepository struct {
	db *gorm.DB
}

func NewTableRepository(db *gorm.DB) TableRepository {
	return &tableRepository{db: db}
}

func (r *tableRepository) FindAll() ([]domain.Table, error) {
	var tables []domain.Table
	err := r.db.Order("number asc").Find(&tables).Error
	return tables, err
}

func (r *tableRepository) FindByID(id uuid.UUID) (*domain.Table, error) {
	var table domain.Table
	err := r.db.First(&table, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &table, nil
}

func (r *tableRepository) Create(table *domain.Table) error {
	return r.db.Create(table).Error
}

func (r *tableRepository) Update(table *domain.Table) error {
	return r.db.Save(table).Error
}

func (r *tableRepository) UpdateStatus(id uuid.UUID, status domain.TableStatus) error {
	return r.db.Model(&domain.Table{}).Where("id = ?", id).Update("status", status).Error
}

func (r *tableRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Table{}, "id = ?", id).Error
}
