package persistence

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bobanboshevski/booking-analytics-service/internal/analyticsmanagement/domain/repository"
)

type PostgresAnalyticsRepository struct {
	db *sql.DB
}

func NewPostgresAnalyticsRepository(db *sql.DB) repository.AnalyticsRepository {
	return &PostgresAnalyticsRepository{db: db}
}

// Monthly stats
func (r *PostgresAnalyticsRepository) GetMonthlyStats(roomID string, start, end time.Time) (int, float64, error) {

	// todo: the pricing per room is just hardcoded to 100 for simplifying.
	query := `
		SELECT COUNT(*),
		COALESCE(SUM((end_date - start_date) * 100), 0)
		FROM bookings
		WHERE room_id = $1
		AND start_date < $3 AND end_date > $2
	`
	// AND start_date >= $2 AND end_date <= $3

	var count int
	var revenue float64

	err := r.db.QueryRow(query, roomID, start, end).Scan(&count, &revenue)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to fetch monthly stats: %w", err)
	}

	return count, revenue, nil
}

// KPI
func (r *PostgresAnalyticsRepository) GetTotalRevenue(roomID string) (float64, int, error) {

	query := `
		SELECT 
		COALESCE(SUM((end_date - start_date) * 100), 0),
		COALESCE(SUM(end_date - start_date), 0)
		FROM bookings
		WHERE room_id = $1
	`

	var revenue float64
	var totalDays int

	err := r.db.QueryRow(query, roomID).Scan(&revenue, &totalDays)
	if err != nil {
		return 0, 0, fmt.Errorf("failed KPI query: %w", err)
	}

	return revenue, totalDays, nil
}

func (r *PostgresAnalyticsRepository) GetTotalBookedDays(roomID string) (int, error) {

	query := `
		SELECT COALESCE(SUM(end_date - start_date), 0)
		FROM bookings
		WHERE room_id = $1
	`

	var days int

	err := r.db.QueryRow(query, roomID).Scan(&days)
	if err != nil {
		return 0, fmt.Errorf("failed KPI query: %w", err)
	}

	return days, nil
}

// Occupancy
func (r *PostgresAnalyticsRepository) GetOccupancyDays(roomID string, start, end time.Time) (int, error) {

	query := `
		SELECT COALESCE(SUM(end_date - start_date), 0)
		FROM bookings
		WHERE room_id = $1
		AND start_date < $3 AND end_date > $2
	`
	// AND start_date >= $2 AND end_date <= $3

	var days int

	err := r.db.QueryRow(query, roomID, start, end).Scan(&days)
	if err != nil {
		return 0, fmt.Errorf("failed occupancy query: %w", err)
	}

	return days, nil
}
