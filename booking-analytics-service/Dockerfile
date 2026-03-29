# BUILD STAGE
FROM golang:1.26-alpine as builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o booking-service ./cmd/server

# RUNTIME STAGE
FROM alpine:latest

WORKDIR /app

# install ca certs (important for production)
RUN apk --no-cache add ca-certificates

COPY --from=builder /app/booking-service .
COPY .env.docker .

EXPOSE 50051

CMD ["./booking-service"]