package grpc

import (
	"context"

	pb "github.com/bobanboshevski/booking-analytics-service/gen/booking"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/application/service"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/interfaces/dto"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/errors"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
)

type BookingHandler struct {
	pb.UnimplementedBookingServiceServer
	service *service.BookingService
}

func NewBookingHandler(svc *service.BookingService) *BookingHandler {
	return &BookingHandler{service: svc}
}

func (h *BookingHandler) CreateBooking(ctx context.Context, req *pb.CreateBookingRequest) (*pb.BookingResponse, error) {
	// Map proto request to DTO
	dtoReq := &dto.BookingRequestDTO{
		RoomID:    req.RoomId,
		GuestName: req.GuestName,
		StartDate: req.StartDate,
		EndDate:   req.EndDate,
	}

	// Validate request DTO
	if err := dtoReq.Validate(); err != nil {
		logger.Log.Warn("invalid booking request", zap.Error(err), zap.Any("request", dtoReq))
		return nil, errors.WrapError(codes.InvalidArgument, "invalid booking request", err)
	}

	// Call service layer
	booking, err := h.service.CreateBooking(dtoReq.RoomID, dtoReq.GuestName, dtoReq.StartDate, dtoReq.EndDate)
	//if err != nil {
	//	logger.Log.Error("failed to create booking", zap.Error(err))
	//	return nil, errors.WrapError(codes.Internal, "failed to create booking", err)
	//}

	if err != nil {
		// Map service errors to gRPC codes
		switch err.Error() {
		case "room does not exist":
			return nil, errors.WrapError(codes.InvalidArgument, "room does not exist", nil)

		case "room already booked for selected dates":
			return nil, errors.WrapError(codes.FailedPrecondition, err.Error(), nil)

		case "invalid start date format, use YYYY-MM-DD",
			"invalid end date format, use YYYY-MM-DD",
			"end date must be after start date":
			return nil, errors.WrapError(codes.InvalidArgument, err.Error(), nil)

		case "unable to save booking, please try again later",
			"unable to verify room, please try again later":
			return nil, errors.WrapError(codes.Internal, "internal error, please try again later", nil)

		default:
			return nil, errors.WrapError(codes.Internal, "internal error, please try again later", nil)
		}
	}

	logger.Log.Info("booking created successfully", zap.String("booking_id", booking.ID))

	// Map domain model to DTO
	respDTO := dto.FromModel(booking)

	// Return proto response
	return &pb.BookingResponse{
		Id:        respDTO.ID,
		RoomId:    respDTO.RoomID,
		GuestName: respDTO.GuestName,
		StartDate: respDTO.StartDate,
		EndDate:   respDTO.EndDate,
	}, nil

	// gRPC-specific error mapping: Service returns generic Go errors, handler maps them to proper codes.InvalidArgument or codes.Internal.
	// No internal error messages exposed: User sees friendly messages (room does not exist, internal error, please try again later).
	// Logging: Only logs internally, including request info and error for debugging.
	// Switch-case mapping ensures structured, user-friendly responses
}

func (h *BookingHandler) GetBooking(ctx context.Context, req *pb.GetBookingRequest) (*pb.BookingResponse, error) {
	// Call service
	booking, err := h.service.GetBooking(req.BookingId)
	if err != nil {
		logger.Log.Error("error fetching booking", zap.Error(err), zap.String("booking_id", req.BookingId))
		return nil, errors.WrapError(codes.Internal, "failed to get booking", err)
	}

	// Check if not found
	if booking == nil {
		logger.Log.Warn("booking not found", zap.String("booking_id", req.BookingId))
		return nil, errors.WrapError(codes.NotFound, "booking not found", nil)
	}

	// Map domain model to DTO
	respDTO := dto.FromModel(booking)

	// Return proto response
	return &pb.BookingResponse{
		Id:        respDTO.ID,
		RoomId:    respDTO.RoomID,
		GuestName: respDTO.GuestName,
		StartDate: respDTO.StartDate,
		EndDate:   respDTO.EndDate,
	}, nil
}

func (h *BookingHandler) UpdateBooking(ctx context.Context, req *pb.UpdateBookingRequest) (*pb.BookingResponse, error) {

	booking, err := h.service.UpdateBooking(req.Id, req.GuestName, req.StartDate, req.EndDate)

	if err != nil {
		switch err.Error() {
		case "room already booked for selected dates":
			return nil, errors.WrapError(codes.InvalidArgument, err.Error(), nil)
		case "invalid start date format", "invalid end date format":
			return nil, errors.WrapError(codes.InvalidArgument, err.Error(), nil)
		default:
			return nil, errors.WrapError(codes.Internal, "failed to update booking", nil)
		}
	}

	if booking == nil {
		return nil, errors.WrapError(codes.NotFound, "booking not found", nil)
	}

	return &pb.BookingResponse{
		Id:        booking.ID,
		RoomId:    booking.RoomID,
		GuestName: booking.GuestName,
		StartDate: booking.StartDate.Format("2006-01-02"),
		EndDate:   booking.EndDate.Format("2006-01-02"),
	}, nil
}

// todo: it can be soft remove - using a boolean flag in the database table.
func (h *BookingHandler) DeleteBooking(ctx context.Context, req *pb.DeleteBookingRequest) (*pb.Empty, error) {

	err := h.service.DeleteBooking(req.Id)
	if err != nil {
		return nil, errors.WrapError(codes.Internal, "failed to delete booking", nil)
	}

	return &pb.Empty{}, nil
}

func (h *BookingHandler) GetBookingsByRoom(ctx context.Context, req *pb.GetBookingsByRoomRequest) (*pb.BookingsResponse, error) {

	bookings, err := h.service.GetBookingsByRoom(req.RoomId)
	if err != nil {
		return nil, errors.WrapError(codes.Internal, "failed to fetch bookings", nil)
	}

	resp := &pb.BookingsResponse{}

	for _, b := range bookings {
		resp.Bookings = append(resp.Bookings, &pb.BookingResponse{
			Id:        b.ID,
			RoomId:    b.RoomID,
			GuestName: b.GuestName,
			StartDate: b.StartDate.Format("2006-01-02"),
			EndDate:   b.EndDate.Format("2006-01-02"),
		})
	}

	return resp, nil
}
