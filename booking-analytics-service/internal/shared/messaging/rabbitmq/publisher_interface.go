package rabbitmq

// EventPublisher is the interface BookingService depends on.
// The real Publisher and the test NoopPublisher both satisfy it.
type EventPublisher interface {
	Publish(event interface{}) error
}
