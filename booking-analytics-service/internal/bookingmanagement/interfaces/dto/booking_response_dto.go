package dto

import (
	"time"

	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/domain/model"
)

// BookingResponseDTO represents a booking for external response
type BookingResponseDTO struct {
	ID        string `json:"id"`
	RoomID    string `json:"room_id"`
	GuestName string `json:"guest_name"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	CreatedAt string `json:"created_at,omitempty"`
	UpdatedAt string `json:"updated_at,omitempty"`
}

func FromModel(b *model.Booking) *BookingResponseDTO {
	return &BookingResponseDTO{
		ID:        b.ID,
		RoomID:    b.RoomID,
		GuestName: b.GuestName,
		StartDate: b.StartDate.Format("2006-01-02"),
		EndDate:   b.EndDate.Format("2006-01-02"),
		CreatedAt: b.CreatedAt.Format(time.RFC3339),
		UpdatedAt: b.UpdatedAt.Format(time.RFC3339),
	}
}
