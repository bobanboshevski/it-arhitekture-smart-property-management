package health

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"go.uber.org/zap"
)

// Dependencies groups everything the health handler needs to inspect.
// Using a struct keeps the handler constructor clean and makes it easy
// to add new checks in the future without changing the function signature.
type Dependencies struct {
	DB              *sql.DB
	RabbitMQAlive   func() bool
	CircuitBreakers func() map[string]string
	ServiceName     string
	Version         string
}

// NewHandler returns an http.Handler that responds with a full health report.
func NewHandler(deps Dependencies) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		checks := make(map[string]ComponentResult)

		// Database check
		checks["database"] = CheckDatabase(deps.DB)

		// RabbitMQ check
		checks["rabbitmq"] = CheckRabbitMQ(deps.RabbitMQAlive)

		// Circuit breaker states (one entry per circuit)
		for name, result := range CheckCircuitBreakers(deps.CircuitBreakers()) {
			checks[name] = result
		}

		report := NewReport(deps.ServiceName, deps.Version, checks)

		// Use 503 when the service is unhealthy or degraded so Docker
		// and load balancers know to stop routing traffic to this instance.
		httpStatus := http.StatusOK
		if report.Status != StatusHealthy {
			httpStatus = http.StatusServiceUnavailable
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(httpStatus)

		if err := json.NewEncoder(w).Encode(report); err != nil {
			logger.Log.Error("failed to encode health report", zap.Error(err))
		}
	})

	return mux
}
