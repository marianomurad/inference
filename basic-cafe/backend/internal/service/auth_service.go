package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/config"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/domain"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/repository"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserInactive       = errors.New("user is inactive")
	ErrInvalidToken       = errors.New("invalid or expired token")
)

type UserResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type TokenPair struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	User         UserResponse `json:"user"`
}

type AuthService interface {
	Login(email, password string) (*TokenPair, error)
	Refresh(refreshToken string) (*TokenPair, error)
	Logout(userID uuid.UUID) error
	GetUserByID(id uuid.UUID) (*domain.User, error)
	ValidateAccessToken(tokenStr string) (*domain.User, error)
}

type authService struct {
	userRepo repository.UserRepository
	redis    *redis.Client
	cfg      *config.Config
}

func NewAuthService(userRepo repository.UserRepository, redis *redis.Client, cfg *config.Config) AuthService {
	return &authService{userRepo: userRepo, redis: redis, cfg: cfg}
}

func (s *authService) Login(email, password string) (*TokenPair, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}
	if !user.Active {
		return nil, ErrUserInactive
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}
	return s.issueTokens(user)
}

func (s *authService) Refresh(refreshToken string) (*TokenPair, error) {
	claims, err := s.parseToken(refreshToken)
	if err != nil {
		return nil, ErrInvalidToken
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return nil, ErrInvalidToken
	}

	key := s.refreshKey(userID)
	stored, err := s.redis.Get(context.Background(), key).Result()
	if err != nil || stored != refreshToken {
		return nil, ErrInvalidToken
	}

	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, ErrInvalidToken
	}
	if !user.Active {
		return nil, ErrUserInactive
	}

	return s.issueTokens(user)
}

func (s *authService) Logout(userID uuid.UUID) error {
	return s.redis.Del(context.Background(), s.refreshKey(userID)).Err()
}

func (s *authService) GetUserByID(id uuid.UUID) (*domain.User, error) {
	return s.userRepo.FindByID(id)
}

func (s *authService) ValidateAccessToken(tokenStr string) (*domain.User, error) {
	claims, err := s.parseToken(tokenStr)
	if err != nil {
		return nil, ErrInvalidToken
	}
	if claims.Issuer != "access" {
		return nil, ErrInvalidToken
	}
	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return nil, ErrInvalidToken
	}
	return s.userRepo.FindByID(userID)
}

func (s *authService) issueTokens(user *domain.User) (*TokenPair, error) {
	now := time.Now().UTC()

	accessClaims := jwt.RegisteredClaims{
		Issuer:    "access",
		Subject:   user.ID.String(),
		ExpiresAt: jwt.NewNumericDate(now.Add(s.cfg.JWTExpiry)),
		IssuedAt:  jwt.NewNumericDate(now),
	}
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	refreshClaims := jwt.RegisteredClaims{
		Issuer:    "refresh",
		Subject:   user.ID.String(),
		ExpiresAt: jwt.NewNumericDate(now.Add(s.cfg.RefreshExpiry)),
		IssuedAt:  jwt.NewNumericDate(now),
	}
	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	if err := s.redis.Set(context.Background(), s.refreshKey(user.ID), refreshToken, s.cfg.RefreshExpiry).Err(); err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: UserResponse{
			ID:    user.ID.String(),
			Name:  user.Name,
			Email: user.Email,
			Role:  string(user.Role),
		},
	}, nil
}

func (s *authService) parseToken(tokenStr string) (*jwt.RegisteredClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}
	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

func (s *authService) refreshKey(userID uuid.UUID) string {
	return fmt.Sprintf("refresh:%s", userID.String())
}
