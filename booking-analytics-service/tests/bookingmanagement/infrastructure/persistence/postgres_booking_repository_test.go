package persistence

import (
	"testing"
	"time"

	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/domain/model"
	"github.com/bobanboshevski/booking-analytics-service/internal/bookingmanagement/infrastructure/persistence"
	"github.com/bobanboshevski/booking-analytics-service/tests/testutils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

// ── helpers ──────────────────────────────────────────────────────────────────

func setupRepo(t *testing.T) (*testutils.TestDB, interface {
	Save(*model.Booking) error
	FindByID(string) (*model.Booking, error)
	FindAll() ([]*model.Booking, error)
	FindByRoomID(string) ([]*model.Booking, error)
	HasOverlappingBooking(string, time.Time, time.Time) (bool, error)
	Update(*model.Booking) error
	DeleteByID(string) error
}) {
	tdb, err := testutils.SetupPostgres()
	assert.NoError(t, err)
	if err != nil {
		t.FailNow()
	}
	return tdb, persistence.NewPostgresBookingRepository(tdb.DB)
}

func newBooking(roomID, guest string, start, end time.Time) *model.Booking {
	return model.NewBooking(roomID, guest, start, end)
}

// ── Save & FindByID ───────────────────────────────────────────────────────────

func TestPostgresBookingRepository_Save_And_FindByID(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	b := newBooking(uuid.New().String(), "Boban", time.Now(), time.Now().Add(24*time.Hour))

	assert.NoError(t, repo.Save(b))

	found, err := repo.FindByID(b.ID)
	assert.NoError(t, err)
	assert.NotNil(t, found)
	assert.Equal(t, b.ID, found.ID)
	assert.Equal(t, "Boban", found.GuestName)
	assert.Equal(t, b.RoomID, found.RoomID)
}

func TestPostgresBookingRepository_FindByID_NotFound(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	found, err := repo.FindByID(uuid.New().String())
	assert.NoError(t, err)
	assert.Nil(t, found) // nil means not found, not an error
}

// ── FindAll ───────────────────────────────────────────────────────────────────

func TestPostgresBookingRepository_FindAll(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	base := time.Now()
	_ = repo.Save(newBooking(uuid.New().String(), "Alice", base, base.Add(24*time.Hour)))
	_ = repo.Save(newBooking(uuid.New().String(), "Bob", base.Add(48*time.Hour), base.Add(72*time.Hour)))

	all, err := repo.FindAll()
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(all), 2)
}

func TestPostgresBookingRepository_FindAll_Empty(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	all, err := repo.FindAll()
	assert.NoError(t, err)
	// May be nil or empty slice — both are acceptable for an empty table
	assert.True(t, len(all) == 0)
}

// ── FindByRoomID ──────────────────────────────────────────────────────────────

func TestPostgresBookingRepository_FindByRoomID(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	roomID := uuid.New().String()
	otherRoom := uuid.New().String()
	base := time.Now()

	_ = repo.Save(newBooking(roomID, "Alice", base, base.Add(24*time.Hour)))
	_ = repo.Save(newBooking(roomID, "Bob", base.Add(48*time.Hour), base.Add(72*time.Hour)))
	_ = repo.Save(newBooking(otherRoom, "Carol", base, base.Add(24*time.Hour)))

	bookings, err := repo.FindByRoomID(roomID)
	assert.NoError(t, err)
	assert.Len(t, bookings, 2)
	for _, b := range bookings {
		assert.Equal(t, roomID, b.RoomID)
	}
}

func TestPostgresBookingRepository_FindByRoomID_NoBookings(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	bookings, err := repo.FindByRoomID(uuid.New().String())
	assert.NoError(t, err)
	assert.Empty(t, bookings)
}

// ── HasOverlappingBooking ─────────────────────────────────────────────────────

func TestPostgresBookingRepository_Overlap_Detected(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	roomID := uuid.New().String()
	start := time.Now()
	end := start.Add(48 * time.Hour)

	_ = repo.Save(newBooking(roomID, "A", start, end))

	// Overlapping window
	overlap, err := repo.HasOverlappingBooking(roomID, start.Add(12*time.Hour), end.Add(12*time.Hour))
	assert.NoError(t, err)
	assert.True(t, overlap)
}

func TestPostgresBookingRepository_Overlap_NotDetected(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	roomID := uuid.New().String()
	start := time.Now()
	end := start.Add(48 * time.Hour)

	_ = repo.Save(newBooking(roomID, "A", start, end))

	// Non-overlapping window (starts after the existing booking ends)
	overlap, err := repo.HasOverlappingBooking(roomID, end.Add(time.Hour), end.Add(72*time.Hour))
	assert.NoError(t, err)
	assert.False(t, overlap)
}

func TestPostgresBookingRepository_Overlap_DifferentRoom(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	roomID := uuid.New().String()
	start := time.Now()
	end := start.Add(48 * time.Hour)

	_ = repo.Save(newBooking(roomID, "A", start, end))

	// Same dates but a DIFFERENT room — should not overlap
	overlap, err := repo.HasOverlappingBooking(uuid.New().String(), start, end)
	assert.NoError(t, err)
	assert.False(t, overlap)
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestPostgresBookingRepository_Update(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	// using fixed wall-clock times — no monotonic component, no timezone ambiguity
	// Midnight UTC — matches exactly what Postgres DATE returns on read-back
	base := time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC)
	newStart := time.Date(2026, 6, 10, 0, 0, 0, 0, time.UTC)
	newEnd := time.Date(2026, 6, 15, 0, 0, 0, 0, time.UTC)

	b := newBooking(uuid.New().String(), "Original", base, base.Add(24*time.Hour))
	assert.NoError(t, repo.Save(b))

	b.GuestName = "Updated"
	b.StartDate = newStart
	b.EndDate = newEnd

	assert.NoError(t, repo.Update(b))

	found, err := repo.FindByID(b.ID)
	assert.NoError(t, err)
	assert.Equal(t, "Updated", found.GuestName)
	assert.True(t, found.StartDate.Equal(newStart), "StartDate mismatch after update")
	assert.True(t, found.EndDate.Equal(newEnd), "EndDate mismatch after update")
}

// ── DeleteByID ────────────────────────────────────────────────────────────────

func TestPostgresBookingRepository_Delete(t *testing.T) {
	tdb, repo := setupRepo(t)
	defer tdb.TearDown()

	b := newBooking(uuid.New().String(), "ToDelete", time.Now(), time.Now().Add(24*time.Hour))
	assert.NoError(t, repo.Save(b))

	// Confirm it exists
	found, err := repo.FindByID(b.ID)
	assert.NoError(t, err)
	assert.NotNil(t, found)

	// Delete and verify it's gone
	assert.NoError(t, repo.DeleteByID(b.ID))

	found, err = repo.FindByID(b.ID)
	assert.NoError(t, err)
	assert.Nil(t, found)
}
