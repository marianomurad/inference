package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/hub"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"gorm.io/gorm"
)

type CreateInventoryItemInput struct {
	Name         string  `validate:"required"`
	Unit         string  `validate:"required"`
	CurrentStock float64 `validate:"gte=0"`
	MinStock     float64 `validate:"gte=0"`
}

type CreateStockEntryInput struct {
	Quantity    float64   `validate:"required,gt=0"`
	CostPerUnit int64     `validate:"gte=0"`
	Supplier    string
	ReceivedBy  uuid.UUID `validate:"required"`
}

type InventoryService interface {
	ListItems() ([]domain.InventoryItem, error)
	GetItem(id uuid.UUID) (*domain.InventoryItem, error)
	GetLowStock() ([]domain.InventoryItem, error)
	CreateItem(input CreateInventoryItemInput) (*domain.InventoryItem, error)
	UpdateItem(id uuid.UUID, input CreateInventoryItemInput) (*domain.InventoryItem, error)

	AddStockEntry(itemID uuid.UUID, input CreateStockEntryInput) (*domain.StockEntry, error)
	ListStockEntries(itemID uuid.UUID) ([]domain.StockEntry, error)
}

type inventoryService struct {
	repo repository.InventoryRepository
	hub  *hub.Hub
}

func NewInventoryService(repo repository.InventoryRepository, h *hub.Hub) InventoryService {
	return &inventoryService{repo: repo, hub: h}
}

func (s *inventoryService) ListItems() ([]domain.InventoryItem, error) {
	return s.repo.FindAll()
}

func (s *inventoryService) GetItem(id uuid.UUID) (*domain.InventoryItem, error) {
	item, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return item, err
}

func (s *inventoryService) GetLowStock() ([]domain.InventoryItem, error) {
	return s.repo.FindLowStock()
}

func (s *inventoryService) CreateItem(input CreateInventoryItemInput) (*domain.InventoryItem, error) {
	item := &domain.InventoryItem{
		ID:           uuid.New(),
		Name:         input.Name,
		Unit:         input.Unit,
		CurrentStock: input.CurrentStock,
		MinStock:     input.MinStock,
		CreatedAt:    time.Now().UTC(),
	}
	if err := s.repo.Create(item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *inventoryService) UpdateItem(id uuid.UUID, input CreateInventoryItemInput) (*domain.InventoryItem, error) {
	item, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	item.Name = input.Name
	item.Unit = input.Unit
	item.MinStock = input.MinStock

	if err := s.repo.Update(item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *inventoryService) AddStockEntry(itemID uuid.UUID, input CreateStockEntryInput) (*domain.StockEntry, error) {
	item, err := s.repo.FindByID(itemID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	entry := &domain.StockEntry{
		ID:              uuid.New(),
		InventoryItemID: itemID,
		Quantity:        input.Quantity,
		CostPerUnit:     input.CostPerUnit,
		Supplier:        input.Supplier,
		ReceivedBy:      input.ReceivedBy,
		ReceivedAt:      time.Now().UTC(),
	}

	if err := s.repo.CreateStockEntry(entry); err != nil {
		return nil, err
	}

	// Check if still low stock after entry
	updatedItem, err := s.repo.FindByID(itemID)
	if err == nil && updatedItem.CurrentStock <= updatedItem.MinStock {
		s.hub.Broadcast(hub.Event{
			Event: "inventory.low_stock",
			Data: map[string]interface{}{
				"itemId":  item.ID,
				"name":    item.Name,
				"current": updatedItem.CurrentStock,
			},
		})
	}

	return entry, nil
}

func (s *inventoryService) ListStockEntries(itemID uuid.UUID) ([]domain.StockEntry, error) {
	_, err := s.repo.FindByID(itemID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return s.repo.FindEntriesByItemID(itemID)
}
