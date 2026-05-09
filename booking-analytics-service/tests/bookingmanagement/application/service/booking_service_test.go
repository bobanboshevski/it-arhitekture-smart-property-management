package service

import (
	"fmt"
	"testing"

	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/application/service"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/infrastructure/persistence"
	"github.com/bobanboshevski/booking-analytics-service/internal/shared/logger"
	"github.com/bobanboshevski/booking-analytics-service/tests/testutils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

// ── setup helpers ─────────────────────────────────────────────────────────────

func setupService(t *testing.T, roomIDs ...string) (*service.BookingService, *testutils.TestDB) {
	logger.InitLogger()

	tdb, err := testutils.SetupPostgres()
	assert.NoError(t, err)
	if err != nil {
		t.FailNow()
	}

	// Build the set of known rooms once — used by both mock functions
	known := make(map[string]bool, len(roomIDs))
	for _, id := range roomIDs {
		known[id] = true
	}

	mockPC := &testutils.MockPropertyClient{
		RoomExistsFn: func(roomID string) (bool, error) {
			return known[roomID], nil
		},
		GetBasePriceFn: func(roomID string) (float64, error) {
			if known[roomID] {
				return 100.0, nil
			}
			return 0, fmt.Errorf("room not found")
		},
	}

	repo := persistence.NewPostgresBookingRepository(tdb.DB)
	svc := service.NewBookingService(repo, mockPC, &testutils.NoopPublisher{})

	return svc, tdb
}

// ── CreateBooking ─────────────────────────────────────────────────────────────

func TestCreateBooking_Success(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	booking, err := svc.CreateBooking(roomID, "Boban", "2026-06-01", "2026-06-05")
	assert.NoError(t, err)
	assert.NotNil(t, booking)
	assert.Equal(t, "Boban", booking.GuestName)
	assert.Equal(t, roomID, booking.RoomID)
}

func TestCreateBooking_RoomDoesNotExist(t *testing.T) {
	svc, tdb := setupService(t) // no rooms registered → all 404
	defer tdb.TearDown()

	_, err := svc.CreateBooking(uuid.New().String(), "Boban", "2026-06-01", "2026-06-05")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "room does not exist")
}

func TestCreateBooking_InvalidStartDate(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	_, err := svc.CreateBooking(roomID, "Boban", "not-a-date", "2026-06-05")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid start date format")
}

func TestCreateBooking_InvalidEndDate(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	_, err := svc.CreateBooking(roomID, "Boban", "2026-06-01", "bad-date")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid end date format")
}

func TestCreateBooking_EndBeforeStart(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	_, err := svc.CreateBooking(roomID, "Boban", "2026-06-10", "2026-06-01")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "end date must be after start date")
}

func TestCreateBooking_Overlap(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	_, err := svc.CreateBooking(roomID, "Alice", "2026-06-01", "2026-06-10")
	assert.NoError(t, err)

	_, err = svc.CreateBooking(roomID, "Bob", "2026-06-05", "2026-06-15")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "room already booked for selected dates")
}

// ── GetBooking ────────────────────────────────────────────────────────────────

func TestGetBooking_Found(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	created, err := svc.CreateBooking(roomID, "Boban", "2026-07-01", "2026-07-05")
	assert.NoError(t, err)

	found, err := svc.GetBooking(created.ID)
	assert.NoError(t, err)
	assert.NotNil(t, found)
	assert.Equal(t, created.ID, found.ID)
}

func TestGetBooking_NotFound(t *testing.T) {
	svc, tdb := setupService(t)
	defer tdb.TearDown()

	found, err := svc.GetBooking(uuid.New().String())
	assert.NoError(t, err) // not found is not an error at service level
	assert.Nil(t, found)   // handler will map nil → NotFound gRPC code
}

// ── UpdateBooking ─────────────────────────────────────────────────────────────

func TestUpdateBooking_Success(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	created, err := svc.CreateBooking(roomID, "Original", "2026-08-01", "2026-08-05")
	assert.NoError(t, err)

	updated, err := svc.UpdateBooking(created.ID, "Updated", "2026-08-10", "2026-08-15")
	assert.NoError(t, err)
	assert.NotNil(t, updated)
	assert.Equal(t, "Updated", updated.GuestName)
}

func TestUpdateBooking_NotFound(t *testing.T) {
	svc, tdb := setupService(t)
	defer tdb.TearDown()

	result, err := svc.UpdateBooking(uuid.New().String(), "X", "2026-08-01", "2026-08-05")
	assert.NoError(t, err) // service returns nil,nil for not-found
	assert.Nil(t, result)
}

func TestUpdateBooking_InvalidDates(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	created, err := svc.CreateBooking(roomID, "Boban", "2026-08-01", "2026-08-05")
	assert.NoError(t, err)

	_, err = svc.UpdateBooking(created.ID, "Boban", "bad", "2026-08-10")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid start date format")
}

func TestUpdateBooking_Overlap(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	// First booking occupies Aug 20-25
	_, err := svc.CreateBooking(roomID, "Alice", "2026-08-20", "2026-08-25")
	assert.NoError(t, err)

	// Second booking that we'll try to move into the first one's window
	second, err := svc.CreateBooking(roomID, "Bob", "2026-09-01", "2026-09-05")
	assert.NoError(t, err)

	_, err = svc.UpdateBooking(second.ID, "Bob", "2026-08-22", "2026-08-28")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "room already booked for selected dates")
}

// ── DeleteBooking ─────────────────────────────────────────────────────────────

func TestDeleteBooking_Success(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	created, err := svc.CreateBooking(roomID, "Boban", "2026-09-01", "2026-09-05")
	assert.NoError(t, err)

	err = svc.DeleteBooking(created.ID)
	assert.NoError(t, err)

	found, err := svc.GetBooking(created.ID)
	assert.NoError(t, err)
	assert.Nil(t, found) // gone
}

// ── GetBookingsByRoom ─────────────────────────────────────────────────────────

func TestGetBookingsByRoom(t *testing.T) {
	roomID := uuid.New().String()
	svc, tdb := setupService(t, roomID)
	defer tdb.TearDown()

	_, _ = svc.CreateBooking(roomID, "Alice", "2026-10-01", "2026-10-05")
	_, _ = svc.CreateBooking(roomID, "Bob", "2026-10-10", "2026-10-15")

	bookings, err := svc.GetBookingsByRoom(roomID)
	assert.NoError(t, err)
	assert.Len(t, bookings, 2)
}

func TestGetBookingsByRoom_Empty(t *testing.T) {
	svc, tdb := setupService(t)
	defer tdb.TearDown()

	bookings, err := svc.GetBookingsByRoom(uuid.New().String())
	assert.NoError(t, err)
	assert.Empty(t, bookings)
}
