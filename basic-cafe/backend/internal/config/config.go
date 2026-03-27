package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

type Config struct {
	Port                  string
	Env                   string
	DatabaseURL           string
	RedisURL              string
	JWTSecret             string
	JWTExpiry             time.Duration
	RefreshExpiry         time.Duration
	PaymentProvider       string
	StripeSecretKey       string
	StripeWebhookSecret   string
	MercadoPagoAccessToken string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Warn().Msg("No .env file found, reading from environment")
	}

	jwtExpiry, err := time.ParseDuration(getEnv("JWT_EXPIRY", "15m"))
	if err != nil {
		jwtExpiry = 15 * time.Minute
	}

	refreshExpiry, err := parseRefreshExpiry(getEnv("REFRESH_EXPIRY", "7d"))
	if err != nil {
		refreshExpiry = 7 * 24 * time.Hour
	}

	return &Config{
		Port:                   getEnv("PORT", "8080"),
		Env:                    getEnv("ENV", "development"),
		DatabaseURL:            getEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/basic_cafe"),
		RedisURL:               getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:              getEnv("JWT_SECRET", "super-secret-key"),
		JWTExpiry:              jwtExpiry,
		RefreshExpiry:          refreshExpiry,
		PaymentProvider:        getEnv("PAYMENT_PROVIDER", "mock"),
		StripeSecretKey:        getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret:    getEnv("STRIPE_WEBHOOK_SECRET", ""),
		MercadoPagoAccessToken: getEnv("MERCADOPAGO_ACCESS_TOKEN", ""),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

// parseRefreshExpiry handles "7d" style durations in addition to standard ones.
func parseRefreshExpiry(s string) (time.Duration, error) {
	if len(s) > 0 && s[len(s)-1] == 'd' {
		days, err := time.ParseDuration(s[:len(s)-1] + "h")
		if err != nil {
			return 0, err
		}
		return days * 24, nil
	}
	return time.ParseDuration(s)
}
