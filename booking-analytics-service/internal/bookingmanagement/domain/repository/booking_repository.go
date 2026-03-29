package repository

import (
	"time"

	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/domain/model"
)

// BookingRepository defines the interface for CRUD operations on Booking
type BookingRepository interface {
	Save(booking *model.Booking) error
	FindByID(id string) (*model.Booking, error)
	FindAll() ([]*model.Booking, error)

	FindByRoomID(roomID string) ([]*model.Booking, error)
	HasOverlappingBooking(roomID string, start, end time.Time) (bool, error)
	Update(booking *model.Booking) error

	DeleteByID(id string) error
}
