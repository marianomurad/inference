package repository

import (
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"gorm.io/gorm"
)

type ProductRepository interface {
	FindAll(activeOnly bool) ([]domain.Product, error)
	FindByID(id uuid.UUID) (*domain.Product, error)
	Create(product *domain.Product) error
	Update(product *domain.Product) error
	Delete(id uuid.UUID) error

	FindAllCategories() ([]domain.Category, error)
	FindCategoryByID(id uuid.UUID) (*domain.Category, error)
	CreateCategory(cat *domain.Category) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) FindAll(activeOnly bool) ([]domain.Product, error) {
	var products []domain.Product
	q := r.db.Preload("Category").Preload("Variants")
	if activeOnly {
		q = q.Where("active = ?", true)
	}
	err := q.Find(&products).Error
	return products, err
}

func (r *productRepository) FindByID(id uuid.UUID) (*domain.Product, error) {
	var product domain.Product
	err := r.db.Preload("Category").Preload("Variants").First(&product, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) Create(product *domain.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(product *domain.Product) error {
	return r.db.Session(&gorm.Session{FullSaveAssociations: true}).Save(product).Error
}

func (r *productRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Product{}, "id = ?", id).Error
}

func (r *productRepository) FindAllCategories() ([]domain.Category, error) {
	var cats []domain.Category
	err := r.db.Find(&cats).Error
	return cats, err
}

func (r *productRepository) FindCategoryByID(id uuid.UUID) (*domain.Category, error) {
	var cat domain.Category
	err := r.db.First(&cat, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

func (r *productRepository) CreateCategory(cat *domain.Category) error {
	return r.db.Create(cat).Error
}
