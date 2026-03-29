package model

import (
	"time"

	"github.com/google/uuid"
)

// Booking represents a reservation for a room
type Booking struct {
	ID        string // UUID
	RoomID    string
	GuestName string
	StartDate time.Time
	EndDate   time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

// NewBooking creates a new Booking instance with a generated ID and timestamps
func NewBooking(roomID, guestName string, startDate, endDate time.Time) *Booking {
	return &Booking{
		ID:        uuid.New().String(),
		RoomID:    roomID,
		GuestName: guestName,
		StartDate: startDate,
		EndDate:   endDate,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}
