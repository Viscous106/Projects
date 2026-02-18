package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	jwtSecret         string
	sessionDuration   time.Duration
}

func NewAuthService(jwtSecret string, sessionDurationHours int) *AuthService {
	return &AuthService{
		jwtSecret:       jwtSecret,
		sessionDuration: time.Duration(sessionDurationHours) * time.Hour,
	}
}

// HashPassword hashes a password using bcrypt
func (a *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(bytes), nil
}

// CheckPassword compares a hashed password with a plain text password
func (a *AuthService) CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// GenerateSessionToken generates a random session token
func (a *AuthService) GenerateSessionToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

// GetSessionExpiry returns the expiration time for a new session
func (a *AuthService) GetSessionExpiry() time.Time {
	return time.Now().Add(a.sessionDuration)
}

// GenerateShareToken generates a random share link token
func (a *AuthService) GenerateShareToken() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate share token: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

// GenerateRandomToken generates a random token with specified byte size
func (a *AuthService) GenerateRandomToken(size int) (string, error) {
	bytes := make([]byte, size)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}
