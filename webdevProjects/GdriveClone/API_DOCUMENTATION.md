# 📚 GDrive API Documentation

Complete guide to all backend API endpoints.

---

## 🔗 Base URL
```
http://localhost:1030
```

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

Creates a new user account and returns a session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "abc123...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "storage_used": 0,
    "storage_limit": 16106127360,
    "created_at": "2025-11-01T12:00:00Z"
  }
}
```

**What it does:**
- Creates new user in database
- Hashes password with bcrypt
- Creates root folder for user
- Generates session token
- Returns token + user info

---

### 2. Login
**POST** `/api/auth/login`

Authenticates existing user and returns session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "xyz789...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "storage_used": 1024,
    "storage_limit": 16106127360
  }
}
```

**What it does:**
- Verifies email exists
- Checks password with bcrypt
- Creates new session
- Returns session token
- Sets session cookie (expires in 30 days)

---

### 3. Get Current User
**GET** `/api/auth/me`

Returns information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "storage": {
    "used": 2048,
    "limit": 16106127360
  }
}
```

**What it does:**
- Validates session token
- Gets user from database
- Calculates storage usage
- Returns user + storage info

---

### 4. Logout
**POST** `/api/auth/logout`

Logs out current user by deleting their session.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "message": "logged out successfully"
}
```

**What it does:**
- Deletes session from database
- Clears session cookie
- User must login again

---

## 📁 File Endpoints

All file endpoints require authentication (Bearer token in Authorization header).

### 5. List Files
**GET** `/api/files`

Get all files for the authenticated user.

**Query Parameters:**
- `folder_id` (optional) - Filter by folder

**Example:**
```
GET /api/files
GET /api/files?folder_id=uuid-here
```

**Response:**
```json
[
  {
    "id": "file-uuid",
    "name": "document.pdf",
    "original_name": "document.pdf",
    "mime_type": "application/pdf",
    "size": 1024000,
    "storage_path": "user_xxx/file_xxx/v1_document.pdf",
    "owner_id": "user-uuid",
    "status": {"file_status": "active"},
    "is_starred": false,
    "created_at": "2025-11-01T12:00:00Z",
    "updated_at": "2025-11-01T12:00:00Z"
  }
]
```

**What it does:**
- Gets all active files for user
- Optionally filter by folder
- Returns array of file objects
- Sorted by creation date (newest first)

---

### 6. Upload File
**POST** `/api/files/upload`

Upload a new file to storage.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - The file to upload (required)
- `folder_id` - Parent folder UUID (optional)

**Example (curl):**
```bash
curl -X POST http://localhost:1030/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "folder_id=folder-uuid"
```

**Response:**
```json
{
  "id": "new-file-uuid",
  "name": "file.pdf",
  "size": 2048,
  "mime_type": "application/pdf",
  "storage_path": "user_xxx/file_xxx/v1_file.pdf",
  "created_at": "2025-11-01T12:00:00Z"
}
```

**What it does:**
- Saves file to filesystem (storage/uploads/)
- Creates database record
- Updates user's storage_used
- Detects MIME type
- Stores with version number (v1, v2, etc.)
- Logs activity (upload event)

**Storage Structure:**
```
storage/uploads/
  └── user_{user_id}/
      └── {file_id}/
          └── v1_{original_filename}
```

---

### 7. Download File
**GET** `/api/files/{id}/download`

Download a file by ID.

**Example:**
```
GET /api/files/abc-123-def/download
```

**Response:**
- Binary file data
- Content-Type header set to file's MIME type
- Content-Disposition header for filename

**What it does:**
- Validates ownership
- Reads file from storage
- Updates last_accessed timestamp
- Streams file to client
- Sets download headers

---

### 8. Delete File (Move to Trash)
**DELETE** `/api/files/{id}`

Moves a file to trash (soft delete).

**Example:**
```
DELETE /api/files/abc-123-def
```

**Response:**
```json
{
  "message": "file moved to trash"
}
```

**What it does:**
- Changes file status to "trashed"
- Sets trashed_at timestamp
- Logs delete activity
- File still in storage (not permanently deleted)

---

### 9. Restore File
**POST** `/api/files/{id}/restore`

Restore a file from trash.

**Example:**
```
POST /api/files/abc-123-def/restore
```

**Response:**
```json
{
  "message": "file restored"
}
```

**What it does:**
- Changes status from "trashed" to "active"
- Clears trashed_at timestamp
- Logs restore activity
- File appears in normal views again

---

### 10. Star/Unstar File
**POST** `/api/files/{id}/star`

Toggle starred status of a file.

**Example:**
```
POST /api/files/abc-123-def/star
```

**Response:**
```json
{
  "message": "star toggled"
}
```

**What it does:**
- Flips is_starred boolean
- If false → true (star)
- If true → false (unstar)

---

### 11. Get Recent Files
**GET** `/api/files/recent`

Get recently accessed files.

**Response:**
```json
[
  {
    "id": "file-uuid",
    "name": "recent.pdf",
    "last_accessed_at": "2025-11-01T11:59:00Z",
    ...
  }
]
```

**What it does:**
- Gets files ordered by last_accessed_at
- Returns max 20 files
- Only active files (not trashed)

---

### 12. Get Starred Files
**GET** `/api/files/starred`

Get all starred/favorited files.

**Response:**
```json
[
  {
    "id": "file-uuid",
    "name": "important.pdf",
    "is_starred": true,
    ...
  }
]
```

**What it does:**
- Filters files where is_starred = true
- Returns all starred files
- Sorted by update date

---

### 13. Get Trashed Files
**GET** `/api/files/trash`

Get all files in trash.

**Response:**
```json
[
  {
    "id": "file-uuid",
    "name": "deleted.pdf",
    "status": {"file_status": "trashed"},
    "trashed_at": "2025-11-01T10:00:00Z",
    ...
  }
]
```

**What it does:**
- Filters files where status = "trashed"
- Sorted by trashed_at (newest first)
- Files can be restored or permanently deleted

---

### 14. Search Files
**GET** `/api/files/search`

Search files by name using full-text search.

**Query Parameters:**
- `q` - Search query (required)

**Example:**
```
GET /api/files/search?q=report
GET /api/files/search?q=presentation
```

**Response:**
```json
[
  {
    "id": "file-uuid",
    "name": "annual_report.pdf",
    ...
  }
]
```

**What it does:**
- Full-text search on file names
- Uses PostgreSQL's text search
- Case-insensitive
- Returns up to 50 results

---

## 📂 Folder Endpoints

### 15. List Folders
**GET** `/api/folders`

Get folders for authenticated user.

**Query Parameters:**
- `parent_id` (optional) - Get subfolders of a folder

**Example:**
```
GET /api/folders
GET /api/folders?parent_id=folder-uuid
```

**Response:**
```json
[
  {
    "id": "folder-uuid",
    "name": "Documents",
    "owner_id": "user-uuid",
    "parent_folder_id": null,
    "is_root": false,
    "created_at": "2025-11-01T12:00:00Z"
  }
]
```

**What it does:**
- Lists all folders for user
- Can filter by parent folder
- Returns folder hierarchy

---

### 16. Create Folder
**POST** `/api/folders`

Create a new folder.

**Request Body:**
```json
{
  "name": "My Documents",
  "parent_folder_id": "parent-uuid-or-null"
}
```

**Response:**
```json
{
  "id": "new-folder-uuid",
  "name": "My Documents",
  "owner_id": "user-uuid",
  "created_at": "2025-11-01T12:00:00Z"
}
```

**What it does:**
- Creates new folder in database
- Can be nested (has parent)
- Returns created folder

---

### 17. Get Root Folder
**GET** `/api/folders/root`

Get the user's root "My Drive" folder.

**Response:**
```json
{
  "id": "root-folder-uuid",
  "name": "My Drive",
  "is_root": true,
  "owner_id": "user-uuid"
}
```

**What it does:**
- Returns the main folder
- Created automatically on registration
- Top-level folder for user

---

## 🏥 Health Check

### 18. Health Check
**GET** `/health`

Check if server is running.

**Response:**
```
OK
```

**What it does:**
- Simple health check
- No authentication required
- Returns "OK" if server is alive

---

## 🔒 Authentication Required

All endpoints except these require authentication:
- ❌ `/health` - No auth needed
- ❌ `/api/auth/register` - No auth needed
- ❌ `/api/auth/login` - No auth needed
- ✅ All other `/api/*` endpoints - **Bearer token required**

---

## 📝 How to Use Authentication

### 1. Register or Login to get token:
```bash
curl -X POST http://localhost:1030/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

Response includes `"token": "abc123..."`

### 2. Use token in subsequent requests:
```bash
curl http://localhost:1030/api/files \
  -H "Authorization: Bearer abc123..."
```

---

## 🎯 Common Use Cases

### Upload a file:
```bash
TOKEN="your-token-here"
curl -X POST http://localhost:1030/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf"
```

### List all files:
```bash
curl http://localhost:1030/api/files \
  -H "Authorization: Bearer $TOKEN"
```

### Download a file:
```bash
curl http://localhost:1030/api/files/{file-id}/download \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded_file.pdf
```

### Search for files:
```bash
curl "http://localhost:1030/api/files/search?q=report" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Response Status Codes

- `200 OK` - Success
- `401 Unauthorized` - Invalid/missing token
- `403 Forbidden` - Not owner of resource
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Email already exists (register)
- `500 Internal Server Error` - Server error

---

## 🏆 All 18 Endpoints Summary

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | `/api/auth/register` | Create account |
| 2 | POST | `/api/auth/login` | Login |
| 3 | GET | `/api/auth/me` | Get current user |
| 4 | POST | `/api/auth/logout` | Logout |
| 5 | GET | `/api/files` | List files |
| 6 | POST | `/api/files/upload` | Upload file |
| 7 | GET | `/api/files/{id}/download` | Download file |
| 8 | DELETE | `/api/files/{id}` | Delete (trash) |
| 9 | POST | `/api/files/{id}/restore` | Restore from trash |
| 10 | POST | `/api/files/{id}/star` | Star/unstar |
| 11 | GET | `/api/files/recent` | Recent files |
| 12 | GET | `/api/files/starred` | Starred files |
| 13 | GET | `/api/files/trash` | Trashed files |
| 14 | GET | `/api/files/search?q=` | Search files |
| 15 | GET | `/api/folders` | List folders |
| 16 | POST | `/api/folders` | Create folder |
| 17 | GET | `/api/folders/root` | Get root folder |
| 18 | GET | `/health` | Health check |

---

**Complete API documentation for your Google Drive clone! 🚀**
