.PHONY: help migrate-up migrate-down migrate-status migrate-create sqlc run build dev install-tools createdb dropdb stop docker-up docker-down dump-db restore-db setup-and-run

include .env
export

help:
	@echo "Available commands:"
	@echo "  make setup-and-run  - Set up the database and run the application"
	@echo "  make install-tools  - Install goose and sqlc"
	@echo "  make createdb       - Create PostgreSQL database"
	@echo "  make dropdb         - Drop PostgreSQL database"
	@echo "  make migrate-up     - Run database migrations"
	@echo "  make migrate-down   - Rollback last migration"
	@echo "  make migrate-status - Check migration status"
	@echo "  make sqlc           - Generate Go code from SQL"
	@echo "  make run            - Run the server"
	@echo "  make build          - Build the binary"
	@echo "  make dev            - Run backend and frontend in development mode"
	@echo "  make stop           - Stop development servers"
	@echo "  make docker-up      - Start PostgreSQL container"
	@echo "  make docker-down    - Stop PostgreSQL container"
	@echo "  make dump-db        - Dump local database to dump.sql"
	@echo "  make restore-db     - Restore database from dump.sql to docker container"

install-tools:
	@echo "Installing goose..."
	go install github.com/pressly/goose/v3/cmd/goose@latest
	@echo "Installing sqlc..."
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
	@echo "Installing air (optional, for hot reload)..."
	go install github.com/cosmtrek/air@latest
	@echo "Tools installed successfully!"

createdb:
	createdb gdrive || psql -U postgres -c "CREATE DATABASE gdrive;"

dropdb:
	dropdb gdrive || psql -U postgres -c "DROP DATABASE gdrive;"

migrate-up:
	goose -dir sql/schema postgres "$(DATABASE_URL)" up

migrate-down:
	goose -dir sql/schema postgres "$(DATABASE_URL)" down

migrate-status:
	goose -dir sql/schema postgres "$(DATABASE_URL)" status

migrate-create:
	@read -p "Migration name: " name; \
	goose -dir sql/schema create $$name sql

sqlc:
	sqlc generate

run:
	go run cmd/server/main.go

build:
	go build -o bin/gdrive cmd/server/main.go

dev:
	@echo "Starting backend (with hot-reload) and frontend..."
	@air & \
	(cd frontend && npm run dev) &

stop:
	@echo "Stopping backend and frontend..."
	@killall -9 air || true
	@killall -9 node || true

docker-up:
	docker compose up -d

docker-down:
	docker compose down

dump-db:
	pg_dump -U postgres -d gdrive -f dump.sql

restore-db:
	cat dump.sql | docker compose exec -T postgres psql -U postgres -d gdrive

setup-and-run:
	@echo "Setting up the database and running the application..."
	@make docker-up
	@echo "Waiting for the database to be ready..."
	@sleep 5
	@make dump-db
	@make restore-db
	@echo "Starting the application..."
	@make dev