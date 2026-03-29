package repository

import "time"

type AnalyticsRepository interface {
	GetMonthlyStats(roomID string, start, end time.Time) (int, float64, error)
	GetTotalRevenue(roomID string) (float64, int, error)
	GetTotalBookedDays(roomID string) (int, error)
	GetOccupancyDays(roomID string, start, end time.Time) (int, error)
}
