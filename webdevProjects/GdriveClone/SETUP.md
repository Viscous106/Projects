# GDrive Clone - Setup Instructions

## Prerequisites
- PostgreSQL 18.0 (installed ✅)
- Go 1.21+ (installed ✅)
- Node.js 18+ (for React frontend)
- goose (installed ✅)
- sqlc (installed ✅)

## 1. Database Setup

### Create PostgreSQL Database

You need to create the database as the postgres superuser. Run ONE of these commands:

**Option A: If you have a postgres user with password:**
```bash
psql -U postgres -c "CREATE DATABASE gdrive;"
```

**Option B: If using peer authentication (Linux):**
```bash
sudo -u postgres createdb gdrive
```

**Option C: Create database and user:**
```bash
sudo -u postgres psql
```
Then in psql:
```sql
CREATE DATABASE gdrive;
CREATE USER sh WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gdrive TO sh;
\q
```

### Update .env file

After creating the database, update the `DATABASE_URL` in `.env`:

**If using postgres user:**
```
DATABASE_URL=postgres://postgres:your_password@localhost:5432/gdrive?sslmode=disable
```

**If you created user 'sh':**
```
DATABASE_URL=postgres://sh:your_password@localhost:5432/gdrive?sslmode=disable
```

## 2. Run Migrations

Once the database is created and .env is updated:

```bash
make migrate-up
```

This will:
- Apply all 8 migrations in order
- Create tables: users, sessions, folders, files, permissions, share_links, file_versions, activity_log
- Track migration status in goose_db_version table

Check migration status:
```bash
make migrate-status
```

## 3. Generate Go Code from SQL

```bash
make sqlc
```

This generates type-safe Go code in `internal/database/` from your SQL queries.

## 4. Run Backend

```bash
make run
```

Backend will run on: http://localhost:1030

## 5. Setup Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running: `systemctl status postgresql`
- Verify database exists: `psql -U postgres -l | grep gdrive`
- Test connection: `psql -U postgres gdrive`

### Migration Issues
- Check status: `make migrate-status`
- Rollback last migration: `make migrate-down`
- View migration errors: Check terminal output

### Port Already in Use
- Change PORT in `.env` file
- Update CORS settings in main.go
