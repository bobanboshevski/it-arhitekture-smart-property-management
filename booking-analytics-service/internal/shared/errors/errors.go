package errors

import (
	"fmt"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// WrapError returns a gRPC status error with code and message
func WrapError(code codes.Code, msg string, err error) error {
	if err != nil {
		msg = fmt.Sprintf("%s: %v", msg, err)
	}
	return status.Error(code, msg)
}
