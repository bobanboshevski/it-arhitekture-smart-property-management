package service

import (
	"errors"
	"time"

	"github.com/bobanboshevski/booking-analytics-service/internal/analyticsmanagement/infrastructure/messaning/event"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/domain/model"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/domain/repository"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/messaging/rabbitmq"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/propertyclient"
	"go.uber.org/zap"
)

// business logic for bookings
type BookingService struct {
	repo           repository.BookingRepository
	propertyClient *propertyclient.PropertyClient
	publisher      rabbitmq.EventPublisher // interface
}

func NewBookingService(
	repo repository.BookingRepository,
	pc *propertyclient.PropertyClient,
	pub rabbitmq.EventPublisher,
) *BookingService {
	return &BookingService{
		repo:           repo,
		propertyClient: pc,
		publisher:      pub,
	}
}

func (s *BookingService) CreateBooking(roomID, guestName, startDateStr, endDateStr string) (*model.Booking, error) {

	// 1. check room existence using property client
	exists, err := s.propertyClient.RoomExists(roomID)

	if err != nil {
		// log internal error, but return generic error to avoid leaking details to the user
		logger.Log.Error("failed to verify room existence", zap.Error(err), zap.String("room_id", roomID))
		return nil, errors.New("Unable to verify room existence at this time, please try again later")
	}

	if !exists {
		logger.Log.Warn("room does not exist", zap.String("room_id", roomID))
		return nil, errors.New("room does not exist")
	}

	// 2. Parse dates
	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		return nil, errors.New("invalid start date format, use YYYY-MM-DD")
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		return nil, errors.New("invalid end date format, use YYYY-MM-DD")
	}

	// 3. validate dates
	if !endDate.After(startDate) {
		return nil, errors.New("end date must be after start date")
	}

	// overlap check - ensure no existing bookings for the room overlap with the requested dates
	overlap, err := s.repo.HasOverlappingBooking(roomID, startDate, endDate, "")
	if err != nil {
		logger.Log.Error("failed overlap check", zap.Error(err))
		return nil, errors.New("unable to verify booking availability")
	}

	if overlap {
		return nil, errors.New("room already booked for selected dates")
	}

	// 4. create booking model
	booking := model.NewBooking(roomID, guestName, startDate, endDate)

	basePrice, err := s.propertyClient.GetRoomBasePrice(roomID)
	if err != nil {
		logger.Log.Error("failed to fetch base price", zap.Error(err))
		return nil, errors.New("failed to fetch base price")
	}

	// 5. save booking
	if err := s.repo.Save(booking); err != nil {
		logger.Log.Error("failed to save booking", zap.Error(err), zap.String("room_id", roomID))
		return nil, errors.New("Unable to save booking, please try again later")
	}

	// CREATING AND PUBLISHING THE BOOKING EVENT
	evt := event.BookingCreatedEvent{
		BookingID: booking.ID,
		RoomID:    booking.RoomID,
		BasePrice: basePrice,
		GuestName: booking.GuestName,
		StartDate: booking.StartDate.Format("2006-01-02"),
		EndDate:   booking.EndDate.Format("2006-01-02"),
	}

	if err := s.publisher.Publish(evt); err != nil {
		logger.Log.Error("failed to publish booking event", zap.Error(err))
	}

	// 6. log success
	logger.Log.Info("booking created successfully", zap.String("booking_id", booking.ID))
	return booking, nil
}

func (s *BookingService) UpdateBooking(id, guestName, startStr, endStr string) (*model.Booking, error) {

	booking, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("failed to find booking")
	}
	if booking == nil {
		return nil, nil
	}

	start, err := time.Parse("2006-01-02", startStr)
	if err != nil {
		return nil, errors.New("invalid start date format")
	}

	end, err := time.Parse("2006-01-02", endStr)
	if err != nil {
		return nil, errors.New("invalid end date format")
	}

	if !end.After(start) {
		return nil, errors.New("end date must be after start date")
	}

	// overlap check again
	overlap, err := s.repo.HasOverlappingBooking(booking.RoomID, start, end, booking.ID)
	if err != nil {
		return nil, errors.New("unable to verify booking availability")
	}

	if overlap {
		return nil, errors.New("room already booked for selected dates")
	}

	booking.GuestName = guestName
	booking.StartDate = start
	booking.EndDate = end

	if err := s.repo.Update(booking); err != nil {
		return nil, errors.New("failed to update booking")
	}

	return booking, nil
}

func (s *BookingService) DeleteBooking(id string) error {
	return s.repo.DeleteByID(id)
}

func (s *BookingService) GetBookingsByRoom(roomID string) ([]*model.Booking, error) {
	return s.repo.FindByRoomID(roomID)
}

func (s *BookingService) GetBooking(id string) (*model.Booking, error) {

	booking, err := s.repo.FindByID(id)

	if err != nil {
		logger.Log.Error("error fetching booking", zap.Error(err), zap.String("booking_id", id))
		return nil, errors.New("failed to get booking, please try again later")
	}

	if booking == nil {
		logger.Log.Warn("booking not found", zap.String("booking_id", id))
		return nil, nil // return nil to indicate not found; handler maps nil to NotFound
	}

	return booking, nil

	// Important notes:

	// logger.Log.Error for internal errors (PropertyClient call, DB save):
	// Gives ops visibility without exposing sensitive info to user

	// errors.New("user friendly message")
	// Ensures API consumer does not see internal stack trace or DB errors

	// Keep business logic here
	// Room existence check and date validation are part of business rules

	// Service does not use gRPC codes
	// Service is independent of transport layer — makes testing easier

	// !! Service layer returns plain errors, possibly with logging.
	// !! Handlers map them to protocol-specific responses.
}
