# Multi-stage Dockerfile for Go binary + NPM dev server

# --- Go Builder Stage ---
FROM golang:1.24-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

# Install goose
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server

# --- Final Node.js Stage ---
FROM node:20-alpine
WORKDIR /app

# Install supervisord AND postgresql-client
#
# !! THIS IS THE UPDATED LINE !!
# We add postgresql-client to give the container the 'psql' command,
# which your run-migrations.sh script needs to check the db connection.
#
RUN apk add --no-cache supervisor postgresql-client

# Copy Go binary and goose from builder
COPY --from=go-builder /app/server /usr/local/bin/server
COPY --from=go-builder /go/bin/goose /usr/local/bin/goose

# Create migrations directory (will be mounted via volume)
RUN mkdir -p /app/migrations

# Copy frontend application files
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

WORKDIR /app

COPY sql/schema ./frontend
# Create migration runner script
COPY run-migrations.sh /usr/local/bin/run-migrations.sh
RUN chmod +x /usr/local/bin/run-migrations.sh

# Create supervisord config
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 1030 1573

# This is correct. The script will run, wait for the DB,
# run migrations, and then 'exec' supervisord to keep the container running.
CMD ["/usr/local/bin/run-migrations.sh"]

