# Google Drive Clone - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    React + Vite + CSS                        │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │  Components  │    Pages     │      Services        │    │
│  │              │              │                      │    │
│  │ - FileViewer │ - Dashboard  │ - API Client (Axios) │    │
│  │ - ShareDialog│ - Login      │ - Auth Service       │    │
│  │ - ContextMenu│ - Register   │ - File Service       │    │
│  │ - Activity   │              │ - Folder Service     │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST API (JSON)
                         │ JWT Authentication
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Backend API                             │
│                  Go + Chi Router                             │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │   Handlers   │  Middleware  │     Services         │    │
│  │              │              │                      │    │
│  │ - Auth       │ - CORS       │ - Auth Service       │    │
│  │ - Files      │ - JWT Auth   │ - Storage Service    │    │
│  │ - Folders    │ - Logging    │ - Thumbnail Gen      │    │
│  │ - Sharing    │              │                      │    │
│  │ - Comments   │              │                      │    │
│  │ - Activity   │              │                      │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ pgx Driver
                         │ SQLC (Type-safe queries)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     PostgreSQL                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: users, files, folders, sessions,            │  │
│  │          permissions, share_links, versions,         │  │
│  │          activity_logs, comments                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   File Storage (Local FS)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  storage/uploads/     - Original files               │  │
│  │  storage/thumbnails/  - Image thumbnails             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Layout Structure

### Main Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Header                                                           │
│  ┌──────┬─────────────────────────────────┬─────────────────┐   │
│  │ ☰    │                                 │ ⓘ ⏰ ? ⚙ 👤      │   │
│  │ Logo │      🔍 Search in Drive         │                 │   │
│  └──────┴─────────────────────────────────┴─────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────┬────────────────────────────────────────────────┐   │
│  │         │  Content Header                                │   │
│  │ Sidebar │  ┌──────────────────────────────────────────┐ │   │
│  │         │  │ My Drive              [List] [Grid]      │ │   │
│  │ ┌─────┐ │  └──────────────────────────────────────────┘ │   │
│  │ │ New │ │                                                │   │
│  │ └─────┘ │  Breadcrumbs: My Drive > Folder1 > Folder2    │   │
│  │         │                                                │   │
│  │ My Drive│  File List Table                               │   │
│  │ Recent  │  ┌────────┬────────┬─────────┬───────┬───────┐│   │
│  │ Starred │  │ Name   │ Owner  │ Last    │ Size  │       ││   │
│  │ Trash   │  │        │        │ modified│       │       ││   │
│  │         │  ├────────┼────────┼─────────┼───────┼───────┤│   │
│  │         │  │📁 Docs │ me     │ Nov 1   │ -     │⭐📤⋯  ││   │
│  │         │  │📄 img  │ me     │ Oct 30  │ 2.3MB │⭐📤⋯  ││   │
│  │         │  │📄 file │ me     │ Oct 29  │ 1.5MB │⭐📤⋯  ││   │
│  │         │  └────────┴────────┴─────────┴───────┴───────┘│   │
│  │         │                                                │   │
│  └─────────┴────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Header (64px height)
- **Left Section**: Menu button + Google Drive logo + "Drive" text
- **Center Section**: Search bar with search icon and advanced search button
- **Right Section**: Info, Activity, Help, Storage, Settings, Profile icons

#### 2. Sidebar (256px width)
- **New Button**: Colorful Google-style button with dropdown menu
- **Navigation Items**:
  - My Drive (active state: blue background)
  - Recent
  - Starred
  - Trash

#### 3. Main Content Area
- **Content Header**: Title + View toggle (List/Grid)
- **Breadcrumb Navigation**: Shows current folder path
- **File List Table**:
  - Columns: Name | Owner | Last modified | File size | Actions
  - Each row has: Star, Share, Download, More menu icons
  - Hover effect: Light gray background
  - Click: Opens file viewer
  - Right-click: Context menu

## Data Flow

### File Upload Flow

```
1. User drags file or clicks "Upload"
   ↓
2. Frontend: FormData with file + folder_id
   ↓
3. POST /api/files/upload
   ↓
4. Backend:
   - Validate file
   - Generate UUID filename
   - Save to storage/uploads/
   - Create thumbnail (if image)
   - Insert to database
   - Update user storage_used
   ↓
5. Return file metadata to frontend
   ↓
6. Frontend refreshes file list
```

### Authentication Flow

```
1. User submits login form
   ↓
2. POST /api/auth/login { email, password }
   ↓
3. Backend:
   - Verify credentials (bcrypt)
   - Generate JWT token
   - Create session in DB
   - Return token + user data
   ↓
4. Frontend:
   - Store token in localStorage
   - Store user in AuthContext
   - Redirect to dashboard
   ↓
5. All subsequent requests include:
   Authorization: Bearer <token>
```

### File Sharing Flow

```
1. User clicks "Share" on file
   ↓
2. ShareDialog opens
   ↓
3. User can:
   a) Share with specific user (search + select role)
      - POST /api/sharing/share
      - Creates permission record

   b) Generate public link
      - POST /api/sharing/link
      - Returns shareable URL
      - Link can be: viewer, editor
      - Link can be deactivated
```

### Folder Navigation Flow

```
1. User clicks folder
   ↓
2. Update currentFolder state with folder.id
   ↓
3. Update breadcrumb path (append folder)
   ↓
4. Fetch files/folders:
   - GET /api/files?folder_id={id}
   - GET /api/folders?parent_id={id}
   ↓
5. Display new content
   ↓
6. User clicks breadcrumb:
   - Navigate back to that folder
   - Update state accordingly
```

## Database Schema Details

### Relationships

```
users (1) ──→ (N) files [owner_id]
users (1) ──→ (N) folders [owner_id]
users (1) ──→ (N) sessions
users (1) ──→ (N) permissions
users (1) ──→ (N) comments

folders (1) ──→ (N) folders [parent_folder_id] (self-referencing)
folders (1) ──→ (N) files [parent_folder_id]

files (1) ──→ (N) file_versions
files (1) ──→ (N) comments
files (1) ──→ (N) activity_logs
files (1) ──→ (N) permissions

permissions (N) ──→ (1) users [user_id]
permissions (polymorphic) ──→ files OR folders [item_type, item_id]

share_links (polymorphic) ──→ files OR folders [item_type, item_id]
```

### Key Indexes

```sql
-- Performance indexes
idx_files_owner          ON files(owner_id)
idx_files_parent_folder  ON files(parent_folder_id)
idx_files_status         ON files(status)
idx_files_starred        ON files(is_starred) WHERE is_starred = TRUE
idx_files_name_search    ON files USING gin(to_tsvector('english', name))

idx_folders_owner        ON folders(owner_id)
idx_folders_parent       ON folders(parent_folder_id)
idx_folders_status       ON folders(status)

idx_activity_user        ON activity_logs(user_id)
idx_activity_file        ON activity_logs(file_id)
idx_activity_created     ON activity_logs(created_at DESC)
```

### Polymorphic Tables

Some tables use polymorphic relationships (item_type + item_id):

```sql
-- permissions table
item_type VARCHAR(10)  -- 'file' or 'folder'
item_id UUID           -- ID of file or folder

-- share_links table
item_type VARCHAR(10)  -- 'file' or 'folder'
item_id UUID           -- ID of file or folder

-- activity_logs table
entity_type VARCHAR(20) -- 'file', 'folder', 'share', etc.
entity_id UUID          -- ID of the entity
```

## API Design Patterns

### RESTful Conventions

```
Resource Actions:
GET    /api/resource        - List all
POST   /api/resource        - Create new
GET    /api/resource/:id    - Get one
PUT    /api/resource/:id    - Update
DELETE /api/resource/:id    - Delete

Special Actions (sub-resources):
POST   /api/files/:id/star      - Toggle star
POST   /api/files/:id/restore   - Restore from trash
GET    /api/files/:id/download  - Download file
GET    /api/files/:id/thumbnail - Get thumbnail
```

### Response Format

Success response:
```json
{
  "id": "uuid",
  "name": "file.pdf",
  "size": 1024000,
  "created_at": "2024-11-01T10:00:00Z"
}
```

List response:
```json
[
  { "id": "uuid1", "name": "file1.pdf" },
  { "id": "uuid2", "name": "file2.pdf" }
]
```

Error response:
```json
{
  "error": "File not found"
}
```

### Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token contains:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "exp": 1699999999
}
```

## Security Architecture

### Authentication & Authorization

1. **Password Security**
   - Bcrypt hashing (cost factor: 10)
   - Minimum 6 characters
   - Stored as hashed_password in DB

2. **JWT Tokens**
   - HS256 signing algorithm
   - Secret key from environment
   - Expiration: 30 days default
   - Stored in localStorage (frontend)

3. **Session Management**
   - Sessions table tracks active sessions
   - Token revocation on logout
   - Automatic cleanup of expired sessions

### Authorization Checks

```go
// File access check
1. Check if user is owner (owner_id = user.id)
2. Check if user has permission (permissions table)
3. Check if file is shared publicly (share_links table)
4. Deny if none of above

// Folder access check
1. Check if user is owner
2. Check if user has permission
3. Check parent folder permissions (recursive)
```

### File Upload Security

1. **Validation**
   - MIME type checking
   - File size limits
   - Extension validation
   - Filename sanitization

2. **Storage**
   - UUID-based filenames (prevent path traversal)
   - Separate storage directory
   - No executable permissions
   - Original filename in DB only

3. **Download**
   - Authorization check before serving
   - Content-Disposition header
   - MIME type verification

## Performance Optimizations

### Database

1. **Indexes**
   - Primary keys (automatic)
   - Foreign keys for joins
   - Frequently queried columns (owner_id, parent_folder_id)
   - Full-text search on filenames
   - Partial index on starred files

2. **Query Optimization**
   - SQLC generates type-safe, efficient queries
   - Connection pooling (pgxpool)
   - Prepared statements
   - Batch operations where possible

### Caching Strategy

Current implementation:
- No caching (simple implementation)

Future improvements:
- Redis for session storage
- CDN for static files
- Browser caching headers
- Thumbnail caching

### File Operations

1. **Thumbnails**
   - Generated on upload (async possible)
   - Cached in storage/thumbnails/
   - Lazy loading in UI

2. **Large Files**
   - Streaming downloads
   - Chunk uploads (can be added)
   - Progress tracking (frontend)

## Scalability Considerations

### Current Architecture
- Single server deployment
- Local filesystem storage
- Single PostgreSQL instance

### Scaling Path

**Horizontal Scaling:**
```
Load Balancer
    ├── App Server 1
    ├── App Server 2
    └── App Server 3
         ├── Shared PostgreSQL (Master-Replica)
         └── S3/Object Storage (instead of local FS)
```

**Required Changes for Scale:**
1. Move file storage to S3/MinIO
2. Use Redis for session storage
3. Database read replicas
4. CDN for thumbnails/static files
5. Queue system for async tasks (thumbnail generation, etc.)

## Error Handling

### Backend

```go
// Standard error responses
- 400 Bad Request    → Invalid input
- 401 Unauthorized   → No/invalid token
- 403 Forbidden      → Valid token but no permission
- 404 Not Found      → Resource doesn't exist
- 500 Server Error   → Internal error
```

### Frontend

```javascript
// Axios interceptor handles:
- 401 → Clear token, redirect to login
- Network errors → Display error message
- Validation errors → Show in form
```

## Testing Strategy

### Backend Testing (To Implement)

```go
// Unit tests
- Handler tests with mock DB
- Service layer tests
- Middleware tests

// Integration tests
- API endpoint tests with test DB
- Authentication flow tests
- File upload/download tests

// Run with:
go test ./...
```

### Frontend Testing (To Implement)

```javascript
// Unit tests (Jest + React Testing Library)
- Component rendering
- User interactions
- API service mocking

// E2E tests (Playwright/Cypress)
- Login/logout flow
- File upload
- Folder navigation
- Sharing functionality

// Run with:
npm test
```

## Monitoring & Logging

### Current Logging

```
Chi middleware logger:
- Request method and path
- Response status
- Request duration
```

### Future Improvements

1. **Application Logging**
   - Structured logging (JSON)
   - Log levels (debug, info, warn, error)
   - Request ID tracking

2. **Metrics**
   - API response times
   - Database query times
   - Storage usage
   - Active users

3. **Error Tracking**
   - Sentry/Rollbar integration
   - Stack traces
   - User context

## Deployment Architecture

### Development

```
Terminal 1: go run cmd/server/main.go     → http://localhost:1030
Terminal 2: cd frontend && npm run dev    → http://localhost:5173
PostgreSQL: localhost:5432
```

### Production (Example)

```
Nginx (Reverse Proxy)
    ├── /api → Go Backend (1030)
    └── /    → React Static Files

Systemd service for Go backend
PostgreSQL as system service
Regular backups of:
    - Database (pg_dump)
    - File storage (rsync/backup)
```

### Environment Configuration

```bash
# Development
DATABASE_URL=postgres://user:pass@localhost:5432/gdrive?sslmode=disable

# Production
DATABASE_URL=postgres://user:pass@db.example.com:5432/gdrive?sslmode=require
```

## Future Enhancements

### Short-term
- [ ] File rename in place (double-click)
- [ ] Bulk operations (multi-select)
- [ ] Keyboard shortcuts
- [ ] File preview for more types
- [ ] Mobile responsive design

### Medium-term
- [ ] Real-time collaboration
- [ ] File/folder copy
- [ ] Advanced file search (content)
- [ ] Quota management UI
- [ ] Email notifications
- [ ] Audit log viewer

### Long-term
- [ ] Document editor (Google Docs style)
- [ ] Spreadsheet editor
- [ ] Presentation editor
- [ ] Real-time sync (like Dropbox)
- [ ] Mobile apps
- [ ] Desktop sync client

## Tech Stack Justification

### Why Go?
- Fast compilation and execution
- Excellent concurrency support
- Strong standard library
- Type safety
- Easy deployment (single binary)

### Why Chi Router?
- Lightweight and fast
- Idiomatic Go
- Good middleware support
- RESTful routing

### Why PostgreSQL?
- ACID compliance
- Full-text search
- JSON support
- Proven reliability
- Great performance

### Why React?
- Component reusability
- Large ecosystem
- Excellent developer experience
- Virtual DOM performance
- Strong community support

### Why Vite?
- Lightning-fast HMR
- Optimized builds
- Modern tooling
- Better than CRA

---

Last Updated: November 2024
Version: 1.0
