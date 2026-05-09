package health

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// CheckDatabase pings the database with a short timeout.
// Returns healthy if the ping succeeds, unhealthy otherwise.
func CheckDatabase(db *sql.DB) ComponentResult {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return ComponentResult{
			Status:  StatusUnhealthy,
			Message: fmt.Sprintf("database ping failed: %s", err.Error()),
		}
	}

	return ComponentResult{Status: StatusHealthy}
}

// CheckRabbitMQ checks whether the AMQP connection is still alive.
// The Publisher exposes IsConnected() for this purpose.
func CheckRabbitMQ(connected func() bool) ComponentResult {
	if !connected() {
		return ComponentResult{
			Status:  StatusUnhealthy,
			Message: "RabbitMQ connection is closed",
		}
	}

	return ComponentResult{Status: StatusHealthy}
}

// CheckCircuitBreakers maps circuit breaker states to component results.
// - "closed"    → healthy   (circuit is letting requests through)
// - "half-open" → degraded  (circuit is testing recovery)
// - "open"      → unhealthy (circuit is blocking all requests)
func CheckCircuitBreakers(states map[string]string) map[string]ComponentResult {
	results := make(map[string]ComponentResult, len(states))

	for name, state := range states {
		switch state {
		case "closed":
			results[name] = ComponentResult{Status: StatusHealthy}
		case "half-open":
			results[name] = ComponentResult{
				Status:  StatusDegraded,
				Message: "circuit is half-open, testing recovery",
			}
		default: // "open"
			results[name] = ComponentResult{
				Status:  StatusUnhealthy,
				Message: "circuit is open, dependency unavailable",
			}
		}
	}

	return results
}
