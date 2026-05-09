package testutils

// MockPropertyClient implements propertyclient.PropertyService for tests.
// Each method's behaviour is controlled by the test via function fields,
// allowing precise simulation of success, failure, and edge cases.
type MockPropertyClient struct {
	RoomExistsFn   func(roomID string) (bool, error)
	GetBasePriceFn func(roomID string) (float64, error)
}

func (m *MockPropertyClient) RoomExists(roomID string) (bool, error) {
	if m.RoomExistsFn != nil {
		return m.RoomExistsFn(roomID)
	}
	return true, nil // default: room always exists
}

func (m *MockPropertyClient) GetRoomBasePrice(roomID string) (float64, error) {
	if m.GetBasePriceFn != nil {
		return m.GetBasePriceFn(roomID)
	}
	return 100.0, nil // default: base price 100
}
