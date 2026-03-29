.PHONY: proto
.PHONY: migrate-up
.PHONY: tests


#clean:
#	rm -rf gen/*

#proto: clean
#	protoc \
#	--go_out=. --go_opt=module=github.com/bobanboshevski/booking-analytics-service \
#	--go-grpc_out=. --go-grpc_opt=module=github.com/bobanboshevski/booking-analytics-service \
#	proto/booking/*.proto \
#	proto/analytics/*.proto

# make proto
proto:
	protoc \
	--go_out=. --go_opt=module=github.com/bobanboshevski/booking-analytics-service \
	--go-grpc_out=. --go-grpc_opt=module=github.com/bobanboshevski/booking-analytics-service \
	proto/booking/*.proto \
	proto/analytics/*.proto

# make migrate-up
migrate-up:
	export $(cat .env.local | xargs) && \
	migrate -path ./migrations -database "postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=disable" up


tests:
	go test ./... -v

