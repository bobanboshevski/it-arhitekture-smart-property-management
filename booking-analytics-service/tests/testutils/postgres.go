package testutils

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/lib/pq"

	"github.com/golang-migrate/migrate/v4"
	migratepg "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	tc "github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
)

type TestDB struct {
	DB        *sql.DB
	Container tc.Container
	Ctx       context.Context
}

func runMigrations(db *sql.DB) error {
	driver, err := migratepg.WithInstance(db, &migratepg.Config{})
	if err != nil {
		return err
	}

	// ✅ Resolve absolute path to project root
	wd, err := os.Getwd()
	if err != nil {
		return err
	}

	// Walk up until we find "migrations" folder
	var migrationsPath string
	current := wd

	for i := 0; i < 5; i++ { // max 5 levels up (safe guard)
		tryPath := current + "/migrations"
		if _, err := os.Stat(tryPath); err == nil {
			migrationsPath = "file://" + tryPath
			break
		}
		current = current + "/.."
	}

	if migrationsPath == "" {
		return fmt.Errorf("could not locate migrations folder from %s", wd)
	}

	fmt.Println("Using migrations path:", migrationsPath)

	m, err := migrate.NewWithDatabaseInstance(
		migrationsPath,
		"postgres",
		driver,
	)
	if err != nil {
		return err
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}

	return nil
}

func SetupPostgres() (*TestDB, error) {
	ctx := context.Background()

	container, err := tcpostgres.RunContainer(ctx,
		tcpostgres.WithDatabase("testdb"),
		tcpostgres.WithUsername("user"),
		tcpostgres.WithPassword("password"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to start container: %w", err)
	}

	connStr, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		return nil, err
	}

	var db *sql.DB
	for i := 0; i < 10; i++ {
		db, err = sql.Open("postgres", connStr)
		if err == nil && db.Ping() == nil {
			break
		}
		time.Sleep(1 * time.Second)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect db: %w", err)
	}

	// 🔍 Debug working directory (remove later if needed)
	wd, _ := os.Getwd()
	fmt.Println("Running tests from:", wd)

	// ✅ Run migrations
	if err := runMigrations(db); err != nil {
		return nil, fmt.Errorf("failed migrations: %w", err)
	}

	return &TestDB{
		DB:        db,
		Container: container,
		Ctx:       ctx,
	}, nil
}

func (t *TestDB) TearDown() {
	if t.DB != nil {
		_ = t.DB.Close()
	}
	if t.Container != nil {
		_ = t.Container.Terminate(t.Ctx)
	}
}
