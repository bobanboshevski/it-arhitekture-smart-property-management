package config

import (
	"database/sql"
	"fmt"

	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"github.com/golang-migrate/migrate/v4"
	migratepg "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"go.uber.org/zap"
)

// RunMigrations applies all pending database migrations.
// It is safe to call on every startup — already-applied migrations
// are skipped automatically. The service will not start if migrations fail.
func RunMigrations(db *sql.DB, migrationsPath string) error {
	logger.Log.Info("running database migrations", zap.String("path", migrationsPath))

	driver, err := migratepg.WithInstance(db, &migratepg.Config{})
	if err != nil {
		return fmt.Errorf("failed to create migration driver: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://"+migrationsPath,
		"postgres",
		driver,
	)
	if err != nil {
		return fmt.Errorf("failed to create migrator: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("migration failed: %w", err)
	}

	if err == migrate.ErrNoChange {
		logger.Log.Info("database migrations: no changes")
	} else {
		logger.Log.Info("database migrations applied successfully")
	}

	return nil
}
