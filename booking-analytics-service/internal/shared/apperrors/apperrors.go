package apperrors

import "fmt"

// CircuitOpenError is returned when the circuit breaker is in the open
// state — the downstream service is known to be unhealthy and the
// circuit is failing fast rather than waiting for a timeout.
type CircuitOpenError struct {
	Service string // e.g. "property-service"
	Method  string // e.g. "RoomExists"
}

func (e *CircuitOpenError) Error() string {
	return fmt.Sprintf(
		"%s is temporarily unavailable, please try again later",
		e.Service,
	)
}

// CircuitHalfOpenError is returned when the circuit is in the half-open
// state and the single probe slot is already occupied by another request.
type CircuitHalfOpenError struct {
	Service string
}

func (e *CircuitHalfOpenError) Error() string {
	return fmt.Sprintf(
		"%s is recovering, please try again shortly",
		e.Service,
	)
}

// DependencyError is returned when an HTTP call to a downstream service
// fails for any reason other than the circuit breaker being open.
// This covers network errors, timeouts, and unexpected status codes.
// It triggers codes.Unavailable in the handler — same as a circuit open
// error — so the client always gets a consistent "retry later" signal
// regardless of whether the circuit has opened yet.
type DependencyError struct {
	Service string
	Method  string
	Cause   error
}

func (e *DependencyError) Error() string {
	return fmt.Sprintf("%s is unavailable, please try again later", e.Service)
}

func (e *DependencyError) Unwrap() error {
	return e.Cause
}
