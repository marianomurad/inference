package repository

import (
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"gorm.io/gorm"
)

type OrderRepository interface {
	FindAll(filters OrderFilters) ([]domain.Order, error)
	FindByID(id uuid.UUID) (*domain.Order, error)
	Create(order *domain.Order) error
	Update(order *domain.Order) error
	UpdateStatus(id uuid.UUID, status domain.OrderStatus) error

	AddItem(item *domain.OrderItem) error
	RemoveItem(orderID, itemID uuid.UUID) error
	FindItemByID(itemID uuid.UUID) (*domain.OrderItem, error)
}

type OrderFilters struct {
	TableID  *uuid.UUID
	WaiterID *uuid.UUID
	Status   *domain.OrderStatus
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) FindAll(filters OrderFilters) ([]domain.Order, error) {
	var orders []domain.Order
	q := r.db.Preload("Table").Preload("Items").Preload("Items.Product").Preload("Items.Variant")
	if filters.TableID != nil {
		q = q.Where("table_id = ?", *filters.TableID)
	}
	if filters.WaiterID != nil {
		q = q.Where("waiter_id = ?", *filters.WaiterID)
	}
	if filters.Status != nil {
		q = q.Where("status = ?", *filters.Status)
	}
	err := q.Order("opened_at desc").Find(&orders).Error
	return orders, err
}

func (r *orderRepository) FindByID(id uuid.UUID) (*domain.Order, error) {
	var order domain.Order
	err := r.db.Preload("Table").Preload("Items").Preload("Items.Product").Preload("Items.Variant").
		First(&order, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) Create(order *domain.Order) error {
	return r.db.Create(order).Error
}

func (r *orderRepository) Update(order *domain.Order) error {
	return r.db.Session(&gorm.Session{FullSaveAssociations: true}).Save(order).Error
}

func (r *orderRepository) UpdateStatus(id uuid.UUID, status domain.OrderStatus) error {
	return r.db.Model(&domain.Order{}).Where("id = ?", id).Update("status", status).Error
}

func (r *orderRepository) AddItem(item *domain.OrderItem) error {
	return r.db.Create(item).Error
}

func (r *orderRepository) RemoveItem(orderID, itemID uuid.UUID) error {
	return r.db.Where("id = ? AND order_id = ?", itemID, orderID).Delete(&domain.OrderItem{}).Error
}

func (r *orderRepository) FindItemByID(itemID uuid.UUID) (*domain.OrderItem, error) {
	var item domain.OrderItem
	err := r.db.Preload("Product").Preload("Variant").First(&item, "id = ?", itemID).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}
