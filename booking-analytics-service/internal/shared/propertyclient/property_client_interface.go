package propertyclient

// PropertyService defines the contract for interacting with the property
// microservice. BookingService depends on this interface, not on the
// concrete HTTP client — enabling the circuit breaker decorator and
// making the service fully testable without a real HTTP server.
type PropertyService interface {
	RoomExists(roomID string) (bool, error)
	GetRoomBasePrice(roomID string) (float64, error)
}
