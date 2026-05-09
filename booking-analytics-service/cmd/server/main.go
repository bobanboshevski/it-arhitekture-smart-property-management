package main

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"

	analyticsPb "github.com/bobanboshevski/booking-analytics-service/gen/analytics"
	bookingPb "github.com/bobanboshevski/booking-analytics-service/gen/booking"
	analyticsServicePkg "github.com/bobanboshevski/booking-analytics-service/internal/analyticsmanagement/application/service"
	analyticsPersistence "github.com/bobanboshevski/booking-analytics-service/internal/analyticsmanagement/infrastructure/persistence"
	analyticsGrpc "github.com/bobanboshevski/booking-analytics-service/internal/analyticsmanagement/interfaces/grpc"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/application/service"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/infrastructure/persistence"
	bookingGrpc "github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/interfaces/grpc"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/messaging/rabbitmq"
	"github.com/joho/godotenv"

	"github.com/bobanboshevski/booking-analytics-service/internal/shared/config"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/propertyclient"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

func main() {

	// Logger
	logger.InitLogger()
	defer logger.Sync()

	// Environment
	envFile := ".env.local"
	if os.Getenv("ENV_FILE") != "" {
		envFile = os.Getenv("ENV_FILE")
	}

	err := godotenv.Load(envFile)
	if err != nil {
		logger.Log.Warn("no .env file found, relying on system env", zap.String("file", envFile))
	}

	log.Println("RabbitMQ URL:", os.Getenv("RABBITMQ_URL")) // todo: i added for debugging

	// Database connection
	db, err := config.NewPostgresDB()
	if err != nil {
		logger.Log.Fatal("failed to connect to DB", zap.Error(err))
	}
	defer db.Close()

	// -------------------------
	// BOOKING SETUP
	// -------------------------
	bookingRepo := persistence.NewPostgresBookingRepository(db)

	// 1. Raw HTTP client — handles only transport concerns
	rawPropertyClient := propertyclient.NewPropertyClient()

	// 2. Circuit breaker decorator — wraps the raw client transparently.
	//    BookingService never knows whether the CB is open or closed.
	propertyClientWithCB := propertyclient.NewCircuitBreakerPropertyClient(rawPropertyClient)

	publisher := rabbitmq.NewPublisher() // returns *Publisher, which satisfies EventPublisher
	bookingService := service.NewBookingService(bookingRepo, propertyClientWithCB, publisher)
	bookingHandler := bookingGrpc.NewBookingHandler(bookingService)

	// -------------------------
	// ANALYTICS SETUP
	// -------------------------
	analyticsRepo := analyticsPersistence.NewPostgresAnalyticsRepository(db)
	analyticsService := analyticsServicePkg.NewAnalyticsService(analyticsRepo, propertyClientWithCB)
	analyticsHandler := analyticsGrpc.NewAnalyticsHandler(analyticsService)

	// Health endpoint (HTTP :8081)
	// Exposes circuit breaker state alongside basic liveness.
	// Runs in a goroutine so it does not block the gRPC server below.
	go func() {
		mux := http.NewServeMux()

		mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			cbState := propertyClientWithCB.State()

			// Overall status is degraded if any circuit is not closed
			status := "healthy"
			httpStatus := http.StatusOK
			for _, s := range cbState {
				if s != "closed" {
					status = "degraded"
					httpStatus = http.StatusServiceUnavailable
					break
				}
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(httpStatus)

			_ = json.NewEncoder(w).Encode(map[string]any{
				"status":          status,
				"service":         "booking-analytics-service",
				"circuitBreakers": cbState,
			})
		})

		logger.Log.Info("health endpoint listening", zap.String("port", "8081"))
		if err := http.ListenAndServe(":8081", mux); err != nil {
			logger.Log.Fatal("health server failed", zap.Error(err))
		}
	}()

	// Start gRPC server
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		logger.Log.Fatal("failed to listen on port", zap.Error(err))
	}

	grpcServer := grpc.NewServer()
	// Register BOTH services
	bookingPb.RegisterBookingServiceServer(grpcServer, bookingHandler)
	analyticsPb.RegisterAnalyticsServiceServer(grpcServer, analyticsHandler)

	logger.Log.Info("gRPC Booking Service started", zap.String("port", "50051"))
	if err := grpcServer.Serve(lis); err != nil {
		logger.Log.Fatal("failed to serve gRPC", zap.Error(err))
	}
}
