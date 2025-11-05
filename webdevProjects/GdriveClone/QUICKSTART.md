# Quick Start Guide

Get your Google Drive clone running in 5 minutes!

## Prerequisites Check

```bash
# Check Go version (need 1.21+)
go version

# Check PostgreSQL (need 14+)
psql --version

# Check Node.js (need 18+)
node --version
npm --version
```

## Step-by-Step Setup

### 1. Database Setup (2 minutes)

```bash
# Create database
createdb gdrive

# Verify it was created
psql -l | grep gdrive
```

### 2. Environment Configuration (1 minute)

Create `.env` file in project root:

```bash
cat > .env << 'EOF'
DATABASE_URL=postgres://your_username:your_password@localhost:5432/gdrive?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-change-this-now
PORT=1030
STORAGE_PATH=storage/uploads
THUMBNAIL_PATH=storage/thumbnails
SESSION_DURATION_HOURS=720
EOF
```

**Important**: Replace `your_username` and `your_password` with your PostgreSQL credentials!

### 3. Run Migrations (30 seconds)

```bash
# If you have the Makefile
make migrate-up

# Or manually with goose
goose -dir sql/schema postgres "$(grep DATABASE_URL .env | cut -d '=' -f2)" up
```

### 4. Build & Run Backend (30 seconds)

```bash
# Build
go build -o bin/server cmd/server/main.go

# Run
./bin/server
```

You should see:
```
✅ Connected to database
🚀 Server starting on http://localhost:1030
```

### 5. Setup Frontend (1 minute)

In a **NEW terminal**:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 6. Open & Test

1. Open browser: http://localhost:5173
2. Click "Register"
3. Create account:
   - Email: test@example.com
   - Name: Test User
   - Password: password123
4. Login with your credentials
5. Try uploading a file!

## Verification Checklist

- [ ] Backend running on port 1030
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can register a new user
- [ ] Can login
- [ ] Can see the Dashboard
- [ ] Can upload a file
- [ ] Can create a folder

## Common Issues

### "DATABASE_URL is required"
- Make sure `.env` file exists in project root
- Check the DATABASE_URL is correctly formatted

### "Failed to connect to database"
- PostgreSQL is not running: `sudo service postgresql start`
- Wrong credentials in DATABASE_URL
- Database doesn't exist: `createdb gdrive`

### "Port 1030 already in use"
- Change PORT in `.env` to something else (e.g., 8080)
- Kill existing process: `lsof -ti:1030 | xargs kill`

### "npm install" fails
- Node version too old: Update to 18+
- Clear cache: `npm cache clean --force`

### Frontend can't connect to backend
- Backend not running: Check terminal 1
- CORS issue: Backend should have CORS enabled by default
- Check API_BASE_URL in frontend/src/services/api.js

## What's Next?

Now that it's running, try these features:

1. **File Operations**
   - Upload files (drag & drop or click "New")
   - Create folders
   - Navigate folder hierarchy
   - Star important files
   - Move files to trash

2. **Search**
   - Use the search bar at the top
   - Try advanced search (filter icon)

3. **Sharing**
   - Click share icon on any file
   - Add users or generate public link

4. **Views**
   - My Drive: All your files
   - Recent: Recently accessed files
   - Starred: Files you've starred
   - Trash: Deleted files (can restore)

5. **Advanced**
   - Right-click for context menu
   - Click file to preview
   - Check version history
   - Add comments
   - View storage analytics

## Development Tips

### Auto-reload Backend

Use `air` for live reload during development:

```bash
# Install air
go install github.com/cosmtrek/air@latest

# Run with air
air
```

### Frontend HMR

Vite provides Hot Module Replacement out of the box. Just save your files and see changes instantly!

### Database GUI

Use a PostgreSQL client for easier database management:
- TablePlus
- pgAdmin
- DBeaver
- Postico (Mac)

### API Testing

Test API endpoints with:
```bash
# Health check
curl http://localhost:1030/health

# Register (example)
curl -X POST http://localhost:1030/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
```

## Production Deployment

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed production deployment instructions.

Quick production checklist:
- [ ] Change JWT_SECRET to a strong random value
- [ ] Use production PostgreSQL database
- [ ] Enable SSL for database (sslmode=require)
- [ ] Build frontend: `npm run build`
- [ ] Serve frontend static files with nginx
- [ ] Set up proper file backup
- [ ] Enable HTTPS
- [ ] Set up monitoring

---

**Need help?** Check out:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design
- GitHub Issues - Report bugs or ask questions
