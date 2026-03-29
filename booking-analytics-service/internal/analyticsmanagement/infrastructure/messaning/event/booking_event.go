package event

type BookingCreatedEvent struct {
	BookingID string  `json:"bookingId"`
	RoomID    string  `json:"roomId"`
	BasePrice float64 `json:"basePrice"`
	GuestName string  `json:"guestName"`
	StartDate string  `json:"startDate"`
	EndDate   string  `json:"endDate"`
}
