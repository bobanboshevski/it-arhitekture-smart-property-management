package circuitbreaker

import (
	"time"

	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"github.com/sony/gobreaker/v2"
	"go.uber.org/zap"
)

// Config holds the tuning parameters for a circuit breaker.
// Centralising these here means every CB in the system is configured
// consistently and the thresholds can be adjusted in one place.
type Config struct {

	// Name identifies the circuit in logs and metrics.
	Name string

	// MaxRequests is how many calls are allowed through while the circuit
	// is in the half-open state (testing whether the dependency recovered).
	// 1 is the safest default — probe with a single request before fully
	// re-opening traffic.
	MaxRequests uint32

	// Interval is the rolling window used to count requests and failures.
	// Counts reset at the end of each interval.
	Interval time.Duration

	// Timeout is how long the circuit stays open before moving to half-open
	// and trying a probe request.
	Timeout time.Duration

	// FailureThreshold is the minimum number of consecutive failures
	// required before the circuit opens.
	FailureThreshold uint32

	// FailureRatioThreshold opens the circuit when the failure ratio
	// exceeds this value AND at least MinRequests have been attempted.
	FailureRatioThreshold float64

	// MinRequests is the minimum sample size before ratio-based tripping
	// kicks in. Prevents a single failure from opening the circuit on
	// a cold start.
	MinRequests uint32
}

// DefaultConfig returns sensible production defaults for an external HTTP
// dependency. I can tune per-dependency if needed.
func DefaultConfig(name string) Config {
	return Config{
		Name:                  name,
		MaxRequests:           1,
		Interval:              10 * time.Second,
		Timeout:               30 * time.Second,
		FailureThreshold:      5,
		FailureRatioThreshold: 0.6,
		MinRequests:           3,
	}

}

// NewSettings converts a Config into a gobreaker.Settings value, wiring
// up the ReadyToTrip function and the state-change observer.
func NewSettings[T any](cfg Config) gobreaker.Settings {
	return gobreaker.Settings{
		Name:        cfg.Name,
		MaxRequests: cfg.MaxRequests,
		Interval:    cfg.Interval,
		Timeout:     cfg.Timeout,

		// ReadyToTrip is called after every failed request.
		// The circuit opens when EITHER threshold is exceeded.
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			// Threshold 1: too many consecutive failures in a row.
			if counts.ConsecutiveFailures >= cfg.FailureThreshold {
				logger.Log.Warn("circuit breaker tripping — consecutive failure threshold exceeded",
					zap.String("name", cfg.Name),
					zap.Uint32("consecutiveFailures", counts.ConsecutiveFailures),
					zap.Uint32("threshold", cfg.FailureThreshold),
				)
				return true
			}

			// Threshold 2: failure ratio exceeded with enough sample data.
			if counts.Requests >= uint32(cfg.MinRequests) {
				ratio := float64(counts.TotalFailures) / float64(counts.Requests)
				if ratio >= cfg.FailureRatioThreshold {
					logger.Log.Warn("circuit breaker tripping — failure ratio threshold exceeded",
						zap.String("name", cfg.Name),
						zap.Float64("ratio", ratio),
						zap.Float64("threshold", cfg.FailureRatioThreshold),
					)
					return true
				}
			}

			return false
		},

		// OnStateChange logs every transition so operators can observe
		// the circuit behaviour in structured logs.
		OnStateChange: func(name string, from, to gobreaker.State) {
			logger.Log.Warn("circuit breaker state changed",
				zap.String("name", name),
				zap.String("from", from.String()),
				zap.String("to", to.String()),
			)
		},
	}
}
