package config

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

// NewPostgresDB returns a connected DB instance using ENV vars
func NewPostgresDB() (*sql.DB, error) {
	// Use ENV vars or defaults
	user := getEnv("POSTGRES_USER", "booking_user")
	pass := getEnv("POSTGRES_PASSWORD", "booking_pass")
	dbName := getEnv("POSTGRES_DB", "booking_db")
	host := getEnv("POSTGRES_HOST", "localhost") // "booking-db" in Docker
	port := getEnv("POSTGRES_PORT", "5436")

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		user, pass, host, port, dbName,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping DB: %w", err)
	}

	return db, nil
}

// getEnv reads environment variable or returns default
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
