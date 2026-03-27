package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/hub"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"gorm.io/gorm"
)

type CreateTableInput struct {
	Number   int     `validate:"required,gt=0"`
	Capacity int     `validate:"required,gt=0"`
	PosX     float64
	PosY     float64
}

type TableService interface {
	ListTables() ([]domain.Table, error)
	GetTable(id uuid.UUID) (*domain.Table, error)
	CreateTable(input CreateTableInput) (*domain.Table, error)
	UpdateTable(id uuid.UUID, input CreateTableInput) (*domain.Table, error)
	UpdateTableStatus(id uuid.UUID, status domain.TableStatus) error
	DeleteTable(id uuid.UUID) error
}

type tableService struct {
	repo repository.TableRepository
	hub  *hub.Hub
}

func NewTableService(repo repository.TableRepository, h *hub.Hub) TableService {
	return &tableService{repo: repo, hub: h}
}

func (s *tableService) ListTables() ([]domain.Table, error) {
	return s.repo.FindAll()
}

func (s *tableService) GetTable(id uuid.UUID) (*domain.Table, error) {
	table, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return table, err
}

func (s *tableService) CreateTable(input CreateTableInput) (*domain.Table, error) {
	table := &domain.Table{
		ID:       uuid.New(),
		Number:   input.Number,
		Capacity: input.Capacity,
		Status:   domain.TableAvailable,
		PosX:     input.PosX,
		PosY:     input.PosY,
	}
	if err := s.repo.Create(table); err != nil {
		return nil, err
	}
	return table, nil
}

func (s *tableService) UpdateTable(id uuid.UUID, input CreateTableInput) (*domain.Table, error) {
	table, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	table.Number = input.Number
	table.Capacity = input.Capacity
	table.PosX = input.PosX
	table.PosY = input.PosY

	if err := s.repo.Update(table); err != nil {
		return nil, err
	}
	return table, nil
}

func (s *tableService) UpdateTableStatus(id uuid.UUID, status domain.TableStatus) error {
	_, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}

	if err := s.repo.UpdateStatus(id, status); err != nil {
		return err
	}

	s.hub.Broadcast(hub.Event{
		Event: "table.status_changed",
		Data: map[string]interface{}{
			"tableId": id,
			"status":  status,
		},
	})
	return nil
}

func (s *tableService) DeleteTable(id uuid.UUID) error {
	_, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}
