package dto

import (
	"github.com/go-playground/validator/v10"
)

// BookingRequestDTO represents a validated booking creation request
type BookingRequestDTO struct {
	RoomID    string `validate:"required,uuid4"`
	GuestName string `validate:"required,min=2,max=100"`
	StartDate string `validate:"required,datetime=2006-01-02"`
	EndDate   string `validate:"required,datetime=2006-01-02"`
}

var validate = validator.New()

func (b *BookingRequestDTO) Validate() error {
	return validate.Struct(b)
}
