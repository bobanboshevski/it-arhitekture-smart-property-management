package service

import (
	"errors"
	"time"

	"github.com/bobanboshevski/booking-analytics-service/internal/analyticsmanagement/domain/model"
	"github.com/bobanboshevski/booking-analytics-service/internal/analyticsmanagement/domain/repository"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/propertyclient"
	"go.uber.org/zap"
)

type AnalyticsService struct {
	repo           repository.AnalyticsRepository
	propertyClient *propertyclient.PropertyClient
}

func NewAnalyticsService(
	repo repository.AnalyticsRepository,
	pc *propertyclient.PropertyClient,
) *AnalyticsService {
	return &AnalyticsService{repo: repo, propertyClient: pc}
}

// Monthly report
func (s *AnalyticsService) GetMonthlyReport(roomID, month, year string) (*model.MonthlyReport, error) {

	start, err := time.Parse("2006-01", year+"-"+month)
	if err != nil {
		return nil, errors.New("invalid date format")
	}

	end := start.AddDate(0, 1, 0)

	count, revenue, err := s.repo.GetMonthlyStats(roomID, start, end)
	if err != nil {
		logger.Log.Error("monthly stats failed", zap.Error(err))
		return nil, errors.New("failed to generate report")
	}

	return &model.MonthlyReport{
		RoomID:        roomID,
		BookingsCount: count,
		Revenue:       revenue,
	}, nil
}

// KPI
func (s *AnalyticsService) GetKPI(roomID, month, year string) (*model.KPI, error) {

	logger.Log.Info("KPI INPUT",
		zap.String("roomID", roomID),
		zap.String("month", month),
		zap.String("year", year),
	)

	start, err := time.Parse("2006-01", year+"-"+month)
	if err != nil {
		return nil, errors.New("invalid date format")
	}
	end := start.AddDate(0, 1, 0)

	// booked days in MONTH
	bookedDays, err := s.repo.GetOccupancyDays(roomID, start, end)
	if err != nil {
		logger.Log.Error("kpi failed", zap.Error(err))
		return nil, errors.New("failed to calculate kpi")
	}

	if bookedDays == 0 {
		return &model.KPI{}, nil
	}

	basePrice, err := s.propertyClient.GetRoomBasePrice(roomID)
	if err != nil {
		logger.Log.Error("failed to fetch base price", zap.Error(err))
		return nil, errors.New("failed to fetch base price")
	}

	// Revenue = basePrice * bookedDays
	revenue := basePrice * float64(bookedDays)

	// ADR
	adr := revenue / float64(bookedDays)

	// Available days in month
	totalDays := float64(end.Sub(start).Hours() / 24)

	logger.Log.Info("total days in month", zap.Float64("totalDays", totalDays))

	// Occupancy
	occupancy := float64(bookedDays) / totalDays

	logger.Log.Info("Booked days", zap.Int("bookedDays", bookedDays))

	// RevPAR (correct formula)
	revpar := adr * occupancy // kolko stane ce revenue radelimo za vsak dan v mesecu

	return &model.KPI{
		ADR:    adr,
		RevPAR: revpar,
	}, nil
}

// Occupancy Rate
func (s *AnalyticsService) GetOccupancyRate(roomID, month, year string) (float64, error) {

	start, err := time.Parse("2006-01", year+"-"+month)
	if err != nil {
		return 0, errors.New("invalid date format")
	}

	end := start.AddDate(0, 1, 0)

	bookedDays, err := s.repo.GetOccupancyDays(roomID, start, end)
	if err != nil {
		logger.Log.Error("occupancy failed", zap.Error(err))
		return 0, errors.New("failed to calculate occupancy")
	}

	totalDays := int(end.Sub(start).Hours() / 24)

	return float64(bookedDays) / float64(totalDays) * 100, nil
}
