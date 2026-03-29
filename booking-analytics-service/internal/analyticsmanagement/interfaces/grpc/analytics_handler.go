package grpc

import (
	"context"

	pb "github.com/bobanboshevski/booking-analytics-service/gen/analytics"
	"github.com/bobanboshevski/booking-analytics-service/internal/analyticsmanagement/application/service"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/errors"
	"google.golang.org/grpc/codes"
)

type AnalyticsHandler struct {
	pb.UnimplementedAnalyticsServiceServer
	service *service.AnalyticsService
}

func NewAnalyticsHandler(s *service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: s}
}

func (h *AnalyticsHandler) GetMonthlyReport(ctx context.Context, req *pb.GetMonthlyReportRequest) (*pb.MonthlyReportResponse, error) {

	report, err := h.service.GetMonthlyReport(req.RoomId, req.Month, req.Year)
	if err != nil {
		return nil, errors.WrapError(codes.Internal, "failed to get report", nil)
	}

	return &pb.MonthlyReportResponse{
		RoomId:        report.RoomID,
		BookingsCount: int32(report.BookingsCount),
		Revenue:       report.Revenue,
	}, nil
}

func (h *AnalyticsHandler) GetKpi(ctx context.Context, req *pb.GetKpiRequest) (*pb.KpiResponse, error) {

	kpi, err := h.service.GetKPI(req.RoomId, req.Month, req.Year)
	if err != nil {
		return nil, errors.WrapError(codes.Internal, "failed to get kpi", nil)
	}

	return &pb.KpiResponse{
		Adr:    kpi.ADR,
		Revpar: kpi.RevPAR,
	}, nil
}

func (h *AnalyticsHandler) GetOccupancyRate(ctx context.Context, req *pb.GetOccupancyRateRequest) (*pb.OccupancyRateResponse, error) {

	rate, err := h.service.GetOccupancyRate(req.RoomId, req.Month, req.Year)
	if err != nil {
		return nil, errors.WrapError(codes.Internal, "failed to get occupancy rate", nil)
	}

	return &pb.OccupancyRateResponse{
		OccupancyRate: rate,
	}, nil
}
