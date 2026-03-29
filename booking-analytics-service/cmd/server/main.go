package main

import (
	"log"
	"net"
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

	// Init structured logger
	logger.InitLogger()
	defer logger.Sync()

	//err := godotenv.Load(".env.local")
	//if err != nil {
	//	logger.Log.Fatal("no .env file found, relying on system env")
	//}

	envFile := ".env.local"
	if os.Getenv("ENV_FILE") != "" {
		envFile = os.Getenv("ENV_FILE")
	}

	err := godotenv.Load(envFile)
	if err != nil {
		logger.Log.Warn("no .env file found, relying on system env", zap.String("file", envFile))
	}

	log.Println("RabbitMQ URL:", os.Getenv("RABBITMQ_URL")) // todo: i added for debugging

	// Connect to DB
	db, err := config.NewPostgresDB()
	if err != nil {
		logger.Log.Fatal("failed to connect to DB", zap.Error(err))
	}
	defer db.Close()

	//// Initialize repository & service
	//repo := persistence.NewPostgresBookingRepository(db)
	//
	//// setup property client
	//pc := propertyclient.NewPropertyClient()
	//
	//service := service.NewBookingService(repo, pc)
	//handler := bookingGrpc.NewBookingHandler(service)

	// -------------------------
	// BOOKING SETUP
	// -------------------------
	bookingRepo := persistence.NewPostgresBookingRepository(db)
	pc := propertyclient.NewPropertyClient()
	publisher := rabbitmq.NewPublisher() // returns *Publisher, which satisfies EventPublisher
	bookingService := service.NewBookingService(bookingRepo, pc, publisher)
	bookingHandler := bookingGrpc.NewBookingHandler(bookingService)

	// -------------------------
	// ANALYTICS SETUP
	// -------------------------
	analyticsRepo := analyticsPersistence.NewPostgresAnalyticsRepository(db)
	analyticsService := analyticsServicePkg.NewAnalyticsService(analyticsRepo, pc)
	analyticsHandler := analyticsGrpc.NewAnalyticsHandler(analyticsService)

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
