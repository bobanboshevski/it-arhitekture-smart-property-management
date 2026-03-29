package persistence

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/domain/model"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/domain/repository"
	_ "github.com/lib/pq"
)

type PostgresBookingRepository struct {
	db *sql.DB
}

// NewPostgresBookingRepository constructor
func NewPostgresBookingRepository(db *sql.DB) repository.BookingRepository {
	return &PostgresBookingRepository{db: db}
}

func (r *PostgresBookingRepository) Save(b *model.Booking) error {
	query := `
		INSERT INTO bookings (id, room_id, guest_name, start_date, end_date, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
	`
	_, err := r.db.Exec(
		query,
		b.ID,
		b.RoomID,
		b.GuestName,
		normalizeTime(b.StartDate),
		normalizeTime(b.EndDate),
		normalizeTime(b.CreatedAt),
		normalizeTime(b.UpdatedAt),
	)
	if err != nil {
		return fmt.Errorf("failed to save booking: %w", err)
	}
	return nil
}

func (r *PostgresBookingRepository) FindByID(id string) (*model.Booking, error) {
	query := `SELECT id, room_id, guest_name, start_date, end_date, created_at, updated_at FROM bookings WHERE id=$1`
	row := r.db.QueryRow(query, id)

	b := &model.Booking{}
	if err := row.Scan(&b.ID, &b.RoomID, &b.GuestName, &b.StartDate, &b.EndDate, &b.CreatedAt, &b.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find booking: %w", err)
	}
	return b, nil
}

func (r *PostgresBookingRepository) FindAll() ([]*model.Booking, error) {
	query := `SELECT id, room_id, guest_name, start_date, end_date, created_at, updated_at FROM bookings`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to find bookings: %w", err)
	}
	defer rows.Close()

	var bookings []*model.Booking
	for rows.Next() {
		b := &model.Booking{}
		if err := rows.Scan(&b.ID, &b.RoomID, &b.GuestName, &b.StartDate, &b.EndDate, &b.CreatedAt, &b.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

func (r *PostgresBookingRepository) HasOverlappingBooking(roomID string, start, end time.Time) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1 FROM bookings
			WHERE room_id = $1
			AND start_date < $3
			AND end_date > $2
		)
	`

	var exists bool
	err := r.db.QueryRow(query, roomID, start, end).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check overlapping bookings: %w", err)
	}

	return exists, nil
}

// find all the bookings for a specific room (+ used for analytics and reporting)
func (r *PostgresBookingRepository) FindByRoomID(roomID string) ([]*model.Booking, error) {
	query := `
		SELECT id, room_id, guest_name, start_date, end_date, created_at, updated_at
		FROM bookings
		WHERE room_id = $1
	`

	rows, err := r.db.Query(query, roomID)
	if err != nil {
		return nil, fmt.Errorf("failed to find bookings by room: %w", err)
	}
	defer rows.Close()

	var bookings []*model.Booking

	for rows.Next() {
		b := &model.Booking{}
		if err := rows.Scan(&b.ID, &b.RoomID, &b.GuestName, &b.StartDate, &b.EndDate, &b.CreatedAt, &b.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}
		bookings = append(bookings, b)
	}

	return bookings, nil
}

func (r *PostgresBookingRepository) Update(b *model.Booking) error {
	query := `
		UPDATE bookings
		SET guest_name=$1, start_date=$2, end_date=$3, updated_at=$4
		WHERE id=$5
	`

	_, err := r.db.Exec(
		query,
		b.GuestName,
		normalizeTime(b.StartDate),
		normalizeTime(b.EndDate),
		normalizeTime(b.UpdatedAt),
		b.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update booking: %w", err)
	}

	return nil
}

func (r *PostgresBookingRepository) DeleteByID(id string) error {
	_, err := r.db.Exec(`DELETE FROM bookings WHERE id=$1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete booking: %w", err)
	}
	return nil
}

func normalizeTime(t time.Time) time.Time {
	return t.UTC().Truncate(time.Second)
}
