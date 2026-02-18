# Google Drive Clone - Complete Setup Guide

## Overview

This is a full-featured Google Drive clone built with:
- **Backend**: Go (Chi router framework)
- **Frontend**: React (Vite + modern CSS)
- **Database**: PostgreSQL
- **File Storage**: Local filesystem

## Features

### Core Features
- ✅ User registration and authentication (JWT-based)
- ✅ File upload, download, rename, delete
- ✅ Folder creation and navigation with hierarchy
- ✅ Drag & drop file upload
- ✅ File and folder starring
- ✅ Trash/Restore functionality
- ✅ Recent files view
- ✅ Advanced search with filters

### Advanced Features
- ✅ File sharing with other users (viewer/editor permissions)
- ✅ Share link generation
- ✅ File version history
- ✅ Activity/audit logs
- ✅ Comments on files
- ✅ Storage usage analytics
- ✅ File thumbnails
- ✅ Right-click context menus
- ✅ Breadcrumb navigation
- ✅ Grid/List view toggle

## Project Structure

```
gdrive/
├── cmd/server/main.go           # Main server entry point
├── internal/
│   ├── database/                # SQLC generated code
│   ├── handlers/                # HTTP request handlers
│   ├── middleware/              # Auth, CORS middleware
│   └── services/                # Business logic (auth, storage)
├── sql/
│   ├── schema/                  # Database migrations
│   └── queries/                 # SQL queries for SQLC
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API client
│   │   └── context/             # React context
│   └── public/
└── storage/                     # File storage directory
```

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    storage_used BIGINT DEFAULT 0,
    storage_limit BIGINT DEFAULT 16106127360, -- 15GB
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### files
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    status file_status DEFAULT 'active',  -- active, trashed
    is_starred BOOLEAN DEFAULT FALSE,
    thumbnail_path TEXT,
    preview_available BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    current_version_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    trashed_at TIMESTAMP,
    last_accessed_at TIMESTAMP
);
```

#### folders
```sql
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    status folder_status DEFAULT 'active',  -- active, trashed
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    trashed_at TIMESTAMP
);
```

### Additional Tables
- `sessions` - User authentication sessions
- `permissions` - File/folder sharing permissions
- `share_links` - Public share links
- `file_versions` - File version history
- `activity_logs` - User activity tracking
- `comments` - File comments

## API Endpoints

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login user
POST   /api/auth/logout         # Logout user
GET    /api/auth/me             # Get current user info
```

### Files
```
GET    /api/files               # List files (query: ?folder_id=uuid)
POST   /api/files/upload        # Upload file
GET    /api/files/recent        # Get recent files
GET    /api/files/starred       # Get starred files
GET    /api/files/trash         # Get trashed files
GET    /api/files/search        # Advanced search
GET    /api/files/:id/download  # Download file
GET    /api/files/:id/thumbnail # Get thumbnail
PUT    /api/files/:id/rename    # Rename file
PUT    /api/files/:id/move      # Move file to folder
POST   /api/files/:id/star      # Toggle star
DELETE /api/files/:id           # Move to trash
POST   /api/files/:id/restore   # Restore from trash
DELETE /api/files/:id/permanent # Permanently delete
```

### Folders
```
GET    /api/folders             # List folders (query: ?parent_id=uuid)
POST   /api/folders             # Create folder
GET    /api/folders/root        # Get root folder
GET    /api/folders/starred     # Get starred folders
GET    /api/folders/trash       # Get trashed folders
GET    /api/folders/:id         # Get folder details
PUT    /api/folders/:id/rename  # Rename folder
PUT    /api/folders/:id/move    # Move folder
POST   /api/folders/:id/star    # Toggle star
DELETE /api/folders/:id         # Move to trash
POST   /api/folders/:id/restore # Restore from trash
DELETE /api/folders/:id/permanent # Permanently delete
```

### Sharing
```
POST   /api/sharing/share           # Share with user
GET    /api/sharing/permissions     # Get item permissions
POST   /api/sharing/revoke          # Revoke permission
POST   /api/sharing/link            # Create share link
GET    /api/sharing/links           # Get share links
DELETE /api/sharing/link/:id        # Deactivate link
GET    /api/sharing/shared-with-me  # Get shared items
```

### Other Features
```
GET    /api/versions/file/:fileId   # Get file versions
GET    /api/activity                # Get user activity
GET    /api/activity/file           # Get file activity
POST   /api/comments                # Create comment
GET    /api/comments                # Get file comments
PUT    /api/comments/:id            # Update comment
DELETE /api/comments/:id            # Delete comment
GET    /api/storage/analytics       # Storage analytics
```

## Installation & Setup

### Prerequisites
- Go 1.21+
- PostgreSQL 14+
- Node.js 18+ & npm
- Make (optional, for using Makefile commands)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd gdrive
```

### 2. Setup PostgreSQL Database
```bash
# Create database
createdb gdrive

# Or using psql
psql -U postgres
CREATE DATABASE gdrive;
\q
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgres://username:password@localhost:5432/gdrive?sslmode=disable

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=1030

# Storage
STORAGE_PATH=storage/uploads
THUMBNAIL_PATH=storage/thumbnails

# Session
SESSION_DURATION_HOURS=720
```

### 4. Run Database Migrations
```bash
# Install goose if not already installed
go install github.com/pressly/goose/v3/cmd/goose@latest

# Run migrations
goose -dir sql/schema postgres "${DATABASE_URL}" up
```

Or if you have a Makefile:
```bash
make migrate-up
```

### 5. Install Go Dependencies
```bash
go mod download
```

### 6. Build the Backend
```bash
go build -o bin/server cmd/server/main.go
```

Or use make:
```bash
make build
```

### 7. Setup Frontend
```bash
cd frontend
npm install
```

### 8. Start the Application

**Terminal 1 - Backend:**
```bash
# From project root
./bin/server

# Or directly with go run
go run cmd/server/main.go
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 9. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:1030
- Health Check: http://localhost:1030/health

## Usage

### First Time Setup
1. Navigate to http://localhost:5173
2. Click "Register" to create a new account
3. Fill in your email, name, and password
4. Login with your credentials

### Basic Operations

#### Upload Files
- Click the "New" button in the sidebar → "File upload"
- Or drag and drop files into the main area

#### Create Folders
- Click the "New" button in the sidebar → "New folder"
- Enter folder name

#### Navigate Folders
- Click on any folder to open it
- Use breadcrumbs at the top to navigate back

#### File Operations
- **Star**: Click the star icon on any file/folder
- **Share**: Click the share icon to share with other users or generate a link
- **Download**: Click the download icon
- **Delete**: Click the trash icon (moves to trash)
- **Right-click**: Opens context menu with all options

#### View Modes
- **My Drive**: Your files and folders
- **Recent**: Recently accessed files
- **Starred**: Files and folders you've starred
- **Trash**: Deleted items (can be restored)

#### Advanced Features
- **Search**: Use the top search bar for quick search
- **Advanced Search**: Click the filters icon for advanced filtering
- **File Preview**: Click on a file to open the preview/viewer
- **Version History**: Right-click a file → "Version history"
- **Comments**: Open a file viewer and use the comments panel
- **Storage Analytics**: Click the storage icon in the header

## Development

### Project Technologies

#### Backend
- **Chi Router**: Lightweight HTTP router
- **pgx**: PostgreSQL driver
- **SQLC**: Type-safe SQL code generation
- **JWT**: Authentication
- **godotenv**: Environment configuration

#### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **React Router**: Navigation
- **Axios**: HTTP client
- **Lucide React**: Icons
- **React Dropzone**: Drag & drop uploads

### Code Generation
The project uses SQLC to generate type-safe Go code from SQL queries:

```bash
# Install sqlc
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# Generate code
sqlc generate
```

### Adding New Features

#### 1. Add Database Schema
Create a new migration in `sql/schema/`:
```bash
# Example: 011_new_feature.sql
-- +goose Up
CREATE TABLE new_table (...);

-- +goose Down
DROP TABLE new_table;
```

#### 2. Add SQL Queries
Create queries in `sql/queries/`:
```sql
-- name: GetNewFeature :one
SELECT * FROM new_table WHERE id = $1;
```

#### 3. Generate Code
```bash
sqlc generate
```

#### 4. Add Handler
Create handler in `internal/handlers/`:
```go
func (h *NewHandler) GetFeature(w http.ResponseWriter, r *http.Request) {
    // Implementation
}
```

#### 5. Add Routes
Update `cmd/server/main.go`:
```go
r.Get("/api/new-feature", handler.GetFeature)
```

#### 6. Add Frontend API
Update `frontend/src/services/api.js`:
```javascript
export const newFeatureAPI = {
  get: async () => {
    const response = await api.get('/new-feature');
    return response.data;
  },
};
```

## Deployment

### Production Build

#### Backend
```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/server cmd/server/main.go
```

#### Frontend
```bash
cd frontend
npm run build
# Output will be in frontend/dist/
```

### Environment Variables for Production
- Change `JWT_SECRET` to a strong random value
- Use a production PostgreSQL database
- Set `DATABASE_URL` with proper credentials
- Consider using SSL for database connection
- Set appropriate `STORAGE_PATH` with proper permissions

### Docker (Optional)
You can create a Dockerfile for containerized deployment:

```dockerfile
# Backend Dockerfile example
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
COPY --from=builder /app/.env .
CMD ["./server"]
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check DATABASE_URL in .env file
- Ensure database exists: `psql -U postgres -l | grep gdrive`

### Migration Errors
- Check migration files in `sql/schema/`
- Verify goose is installed: `goose -version`
- Check migration status: `goose -dir sql/schema postgres "${DATABASE_URL}" status`

### Frontend Can't Connect to Backend
- Verify backend is running on port 1030
- Check CORS settings in `internal/middleware/cors.go`
- Ensure API_BASE_URL in frontend matches backend port

### File Upload Fails
- Check `STORAGE_PATH` directory exists and has write permissions
- Verify file size limits
- Check available disk space

## Security Considerations

1. **Authentication**
   - JWT tokens stored in localStorage
   - Tokens expire after SESSION_DURATION_HOURS
   - Passwords hashed with bcrypt

2. **Authorization**
   - All protected routes use AuthMiddleware
   - File/folder access controlled by ownership and permissions
   - Sharing permissions: viewer, editor, owner

3. **File Storage**
   - Files stored with UUIDs to prevent path traversal
   - Original filenames preserved in database
   - MIME type validation

4. **Best Practices**
   - Use HTTPS in production
   - Set strong JWT_SECRET
   - Regular database backups
   - Monitor storage usage
   - Rate limiting (consider adding)

## License

MIT License (or your preferred license)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (if available)
5. Submit a pull request

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API endpoints in code

---

Built with ❤️ using Go and React
