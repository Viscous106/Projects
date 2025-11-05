#!/bin/sh
set -e

echo "Waiting for postgres to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
    echo "Postgres is unavailable - sleeping"
    sleep 1
done

echo "Postgres is up - running migrations"

# Run goose migrations
cd /app/migrations
goose postgres "$DATABASE_URL" up

echo "Migrations completed successfully"

# Start supervisord to run both Go and NPM processes
exec /usr/bin/supervisord -c /etc/supervisord.conf
