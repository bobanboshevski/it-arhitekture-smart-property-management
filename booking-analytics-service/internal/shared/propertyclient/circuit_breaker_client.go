package propertyclient

import (
	"errors"

	"github.com/bobanboshevski/booking-analytics-service/internal/shared/apperrors"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/circuitbreaker"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"github.com/sony/gobreaker/v2"
	"go.uber.org/zap"
)

// CircuitBreakerPropertyClient wraps any PropertyService implementation
// with per-method circuit breakers. It implements PropertyService itself,
// so it is a transparent decorator — callers never know it is there.
//
// Two independent circuits are used deliberately:
//   - A slow RoomExists does not affect GetRoomBasePrice and vice versa.
//   - If only one endpoint of the property service misbehaves, only its
//     circuit opens — the other continues working normally.
type CircuitBreakerPropertyClient struct {
	inner        PropertyService
	roomExistsCB *gobreaker.CircuitBreaker[bool]
	basePriceCB  *gobreaker.CircuitBreaker[float64]
}

// NewCircuitBreakerPropertyClient constructs a decorator around the given
// PropertyService. Each method gets its own independently tuned circuit.
func NewCircuitBreakerPropertyClient(inner PropertyService) *CircuitBreakerPropertyClient {
	roomExistsSettings := circuitbreaker.NewSettings[bool](
		circuitbreaker.DefaultConfig("property-service.RoomExists"),
	)

	basePriceSettings := circuitbreaker.NewSettings[float64](
		circuitbreaker.DefaultConfig("property-service.GetRoomBasePrice"),
	)

	return &CircuitBreakerPropertyClient{
		inner:        inner,
		roomExistsCB: gobreaker.NewCircuitBreaker[bool](roomExistsSettings),
		basePriceCB:  gobreaker.NewCircuitBreaker[float64](basePriceSettings),
	}
}

// RoomExists calls the underlying client's RoomExists through the circuit
// breaker. When the circuit is open it returns immediately with a clear
// error instead of waiting for the HTTP timeout.
func (c *CircuitBreakerPropertyClient) RoomExists(roomID string) (bool, error) {
	result, err := c.roomExistsCB.Execute(func() (bool, error) {
		return c.inner.RoomExists(roomID)
	})

	if err != nil {
		return false, c.mapError("RoomExists", roomID, err)
	}

	return result, nil
}

// GetRoomBasePrice calls the underlying client's GetRoomBasePrice through
// its own circuit breaker, independent of the RoomExists circuit.
func (c *CircuitBreakerPropertyClient) GetRoomBasePrice(roomID string) (float64, error) {
	result, err := c.basePriceCB.Execute(func() (float64, error) {
		return c.inner.GetRoomBasePrice(roomID)
	})

	if err != nil {
		return 0, c.mapError("GetRoomBasePrice", roomID, err)
	}

	return result, nil
}

// mapError translates gobreaker sentinel errors into user-friendly messages
// and logs the appropriate level for each case.
func (c *CircuitBreakerPropertyClient) mapError(method, roomID string, err error) error {
	switch {
	case errors.Is(err, gobreaker.ErrOpenState):
		logger.Log.Error("circuit open — property service unavailable",
			zap.String("method", method),
			zap.String("room_id", roomID),
		)
		return &apperrors.CircuitOpenError{
			Service: "property-service",
			Method:  method,
		}

	case errors.Is(err, gobreaker.ErrTooManyRequests):
		logger.Log.Warn("circuit half-open — probe slot occupied",
			zap.String("method", method),
			zap.String("room_id", roomID),
		)
		return &apperrors.CircuitHalfOpenError{
			Service: "property-service",
		}

	default:
		// Raw HTTP failure — network error, timeout, unexpected status code.
		// Wrap in DependencyError so the handler maps it to codes.Unavailable
		// consistently from the very first failure, not just after the circuit opens.
		logger.Log.Error("property service call failed",
			zap.String("method", method),
			zap.String("room_id", roomID),
			zap.Error(err),
		)
		return &apperrors.DependencyError{
			Service: "property-service",
			Method:  method,
			Cause:   err,
		}
		//return fmt.Errorf("property service request failed: %w", err) // todo: why ftm and not apperrors?
	}
}

// State returns the current state of both circuits for health check purposes.
func (c *CircuitBreakerPropertyClient) State() map[string]string {
	return map[string]string{
		"property-service.RoomExists":       c.roomExistsCB.State().String(),
		"property-service.GetRoomBasePrice": c.basePriceCB.State().String(),
	}
}
