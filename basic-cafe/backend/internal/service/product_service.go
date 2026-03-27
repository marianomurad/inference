package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"gorm.io/gorm"
)

var ErrNotFound = errors.New("not found")

type CreateProductInput struct {
	CategoryID  uuid.UUID              `validate:"required"`
	Name        string                 `validate:"required"`
	Description string
	BasePrice   int64                  `validate:"gte=0"`
	ImageURL    string
	Variants    []CreateVariantInput
}

type CreateVariantInput struct {
	Name      string `validate:"required"`
	PriceDiff int64
}

type ProductService interface {
	ListProducts(activeOnly bool) ([]domain.Product, error)
	GetProduct(id uuid.UUID) (*domain.Product, error)
	CreateProduct(input CreateProductInput) (*domain.Product, error)
	UpdateProduct(id uuid.UUID, input CreateProductInput) (*domain.Product, error)
	DeleteProduct(id uuid.UUID) error

	ListCategories() ([]domain.Category, error)
	CreateCategory(name string) (*domain.Category, error)
}

type productService struct {
	repo repository.ProductRepository
}

func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{repo: repo}
}

func (s *productService) ListProducts(activeOnly bool) ([]domain.Product, error) {
	return s.repo.FindAll(activeOnly)
}

func (s *productService) GetProduct(id uuid.UUID) (*domain.Product, error) {
	p, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return p, err
}

func (s *productService) CreateProduct(input CreateProductInput) (*domain.Product, error) {
	product := &domain.Product{
		ID:          uuid.New(),
		CategoryID:  input.CategoryID,
		Name:        input.Name,
		Description: input.Description,
		BasePrice:   input.BasePrice,
		ImageURL:    input.ImageURL,
		Active:      true,
	}
	for _, v := range input.Variants {
		product.Variants = append(product.Variants, domain.ProductVariant{
			ID:        uuid.New(),
			ProductID: product.ID,
			Name:      v.Name,
			PriceDiff: v.PriceDiff,
		})
	}
	if err := s.repo.Create(product); err != nil {
		return nil, err
	}
	return s.repo.FindByID(product.ID)
}

func (s *productService) UpdateProduct(id uuid.UUID, input CreateProductInput) (*domain.Product, error) {
	product, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	product.CategoryID = input.CategoryID
	product.Name = input.Name
	product.Description = input.Description
	product.BasePrice = input.BasePrice
	product.ImageURL = input.ImageURL

	product.Variants = nil
	for _, v := range input.Variants {
		product.Variants = append(product.Variants, domain.ProductVariant{
			ID:        uuid.New(),
			ProductID: product.ID,
			Name:      v.Name,
			PriceDiff: v.PriceDiff,
		})
	}

	if err := s.repo.Update(product); err != nil {
		return nil, err
	}
	return s.repo.FindByID(product.ID)
}

func (s *productService) DeleteProduct(id uuid.UUID) error {
	_, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}

func (s *productService) ListCategories() ([]domain.Category, error) {
	return s.repo.FindAllCategories()
}

func (s *productService) CreateCategory(name string) (*domain.Category, error) {
	cat := &domain.Category{
		ID:   uuid.New(),
		Name: name,
	}
	if err := s.repo.CreateCategory(cat); err != nil {
		return nil, err
	}
	return cat, nil
}
