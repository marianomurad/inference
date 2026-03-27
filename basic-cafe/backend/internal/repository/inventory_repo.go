package repository

import (
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"gorm.io/gorm"
)

type InventoryRepository interface {
	FindAll() ([]domain.InventoryItem, error)
	FindByID(id uuid.UUID) (*domain.InventoryItem, error)
	FindLowStock() ([]domain.InventoryItem, error)
	Create(item *domain.InventoryItem) error
	Update(item *domain.InventoryItem) error

	CreateStockEntry(entry *domain.StockEntry) error
	FindEntriesByItemID(itemID uuid.UUID) ([]domain.StockEntry, error)
}

type inventoryRepository struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) InventoryRepository {
	return &inventoryRepository{db: db}
}

func (r *inventoryRepository) FindAll() ([]domain.InventoryItem, error) {
	var items []domain.InventoryItem
	err := r.db.Find(&items).Error
	return items, err
}

func (r *inventoryRepository) FindByID(id uuid.UUID) (*domain.InventoryItem, error) {
	var item domain.InventoryItem
	err := r.db.First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *inventoryRepository) FindLowStock() ([]domain.InventoryItem, error) {
	var items []domain.InventoryItem
	err := r.db.Where("current_stock <= min_stock").Find(&items).Error
	return items, err
}

func (r *inventoryRepository) Create(item *domain.InventoryItem) error {
	return r.db.Create(item).Error
}

func (r *inventoryRepository) Update(item *domain.InventoryItem) error {
	return r.db.Save(item).Error
}

func (r *inventoryRepository) CreateStockEntry(entry *domain.StockEntry) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(entry).Error; err != nil {
			return err
		}
		return tx.Model(&domain.InventoryItem{}).
			Where("id = ?", entry.InventoryItemID).
			UpdateColumn("current_stock", gorm.Expr("current_stock + ?", entry.Quantity)).Error
	})
}

func (r *inventoryRepository) FindEntriesByItemID(itemID uuid.UUID) ([]domain.StockEntry, error) {
	var entries []domain.StockEntry
	err := r.db.Preload("InventoryItem").Where("inventory_item_id = ?", itemID).Find(&entries).Error
	return entries, err
}
