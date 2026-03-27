package main

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/config"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/database"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/handler"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/hub"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/middleware"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/payment"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/router"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/service"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Logging setup
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	if os.Getenv("ENV") == "development" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	// Load configuration
	cfg := config.Load()

	// Connect to PostgreSQL
	db, err := database.NewPostgres(cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to PostgreSQL")
	}

	// Connect to Redis
	redisClient, err := database.NewRedis(cfg.RedisURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to Redis")
	}

	// Run migrations
	m, err := migrate.New("file://migrations", cfg.DatabaseURL)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to init migrations (continuing)")
	} else {
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Warn().Err(err).Msg("Migration error (continuing)")
		} else {
			log.Info().Msg("Migrations applied")
		}
	}

	// Payment provider
	var paymentProvider payment.Provider
	switch cfg.PaymentProvider {
	case "stripe":
		paymentProvider = payment.NewStripeProvider(cfg.StripeSecretKey, cfg.StripeWebhookSecret)
	case "mercadopago":
		paymentProvider = payment.NewMercadoPagoProvider(cfg.MercadoPagoAccessToken)
	default:
		paymentProvider = payment.NewMockProvider()
	}

	// Repositories
	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	inventoryRepo := repository.NewInventoryRepository(db)
	tableRepo := repository.NewTableRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	paymentRepo := repository.NewPaymentRepository(db)

	// WebSocket hub
	wsHub := hub.New()

	// Services
	authSvc := service.NewAuthService(userRepo, redisClient, cfg)
	productSvc := service.NewProductService(productRepo)
	inventorySvc := service.NewInventoryService(inventoryRepo, wsHub)
	tableSvc := service.NewTableService(tableRepo, wsHub)
	orderSvc := service.NewOrderService(orderRepo, productRepo, wsHub)
	checkoutSvc := service.NewCheckoutService(orderRepo, paymentRepo, paymentProvider, wsHub)

	// Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": fiber.Map{
					"code":    "INTERNAL_ERROR",
					"message": err.Error(),
					"details": nil,
				},
			})
		},
	})

	// Global middleware
	app.Use(middleware.Logger())
	app.Use(middleware.CORS())

	// Wire handlers
	handlers := router.Handlers{
		Auth:      handler.NewAuthHandler(authSvc),
		User:      handler.NewUserHandler(userRepo),
		Product:   handler.NewProductHandler(productSvc),
		Inventory: handler.NewInventoryHandler(inventorySvc),
		Table:     handler.NewTableHandler(tableSvc),
		Order:     handler.NewOrderHandler(orderSvc),
		Checkout:  handler.NewCheckoutHandler(checkoutSvc),
		Report:    handler.NewReportHandler(db),
		Hub:       wsHub,
		AuthSvc:   authSvc,
	}

	// Setup routes
	router.Setup(app, handlers)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Info().Str("addr", addr).Str("env", cfg.Env).Msg("Starting server")

	if err := app.Listen(addr); err != nil {
		log.Fatal().Err(err).Msg("Server failed")
	}
}
