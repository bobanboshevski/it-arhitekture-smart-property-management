package testutils

// NoopPublisher satisfies rabbitmq.EventPublisher but does nothing.
// we use it in tests to avoid a real RabbitMQ connection.
type NoopPublisher struct{}

func (n *NoopPublisher) Publish(_ interface{}) error { return nil }
