# Google Drive Clone - API Documentation

Base URL: `http://localhost:1030/api`

## Authentication

All authenticated endpoints require a session token passed via:
- Cookie: `session_token`
- OR Header: `Authorization: Bearer {token}`

---

## Authentication Endpoints

### Register
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "storage_used": 0,
    "storage_limit": 16106127360,
    "created_at": "2025-11-02T00:00:00Z"
  },
  "token": "session_token_here"
}
```

**Notes:**
- Automatically creates root "My Drive" folder
- Default storage limit: 15GB
- Session expires after 30 days

---

### Login
Authenticate existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "token": "session_token_here"
}
```

---

### Get Current User
Get authenticated user information.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "storage_used": 1048576,
  "storage_limit": 16106127360
}
```

---

### Logout
End current session.

**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "message": "logged out successfully"
}
```

---

## File Endpoints

### List Files
Get files in a folder (or root).

**Endpoint:** `GET /api/files`

**Query Parameters:**
- `folder_id` (optional): UUID of parent folder

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "document.pdf",
    "original_name": "document.pdf",
    "mime_type": "application/pdf",
    "size": 1048576,
    "storage_path": "user_xxx/file_xxx/v1_document.pdf",
    "owner_id": "uuid",
    "parent_folder_id": "uuid",
    "status": "active",
    "is_starred": false,
    "thumbnail_path": "uuid.jpg",
    "preview_available": true,
    "version": 1,
    "created_at": "2025-11-02T00:00:00Z",
    "updated_at": "2025-11-02T00:00:00Z",
    "last_accessed_at": "2025-11-02T00:00:00Z"
  }
]
```

---

### Upload File
Upload a new file.

**Endpoint:** `POST /api/files/upload`

**Headers:** `Content-Type: multipart/form-data`

**Form Data:**
- `file`: File binary
- `folder_id` (optional): Parent folder UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "image.jpg",
  "size": 524288,
  "thumbnail_path": "uuid.jpg",
  ...
}
```

**Notes:**
- Max upload size: 500MB
- Thumbnails auto-generated for images
- Updates user storage quota

---

### Download File
Download file content.

**Endpoint:** `GET /api/files/{id}/download`

**Response:** Binary file stream

**Headers:**
- `Content-Type`: File's MIME type
- `Content-Disposition`: attachment; filename="..."
- `Content-Length`: File size

---

### Get File Thumbnail
Get image thumbnail (200x200 JPEG).

**Endpoint:** `GET /api/files/{id}/thumbnail`

**Response:** Binary JPEG image

**Headers:**
- `Content-Type`: image/jpeg
- `Cache-Control`: public, max-age=31536000

---

### Delete File (Move to Trash)
Soft delete a file.

**Endpoint:** `DELETE /api/files/{id}`

**Response:** `200 OK`
```json
{
  "message": "file moved to trash"
}
```

---

### Restore File
Restore file from trash.

**Endpoint:** `POST /api/files/{id}/restore`

**Response:** `200 OK`
```json
{
  "message": "file restored"
}
```

---

### Toggle Star
Star or unstar a file.

**Endpoint:** `POST /api/files/{id}/star`

**Response:** `200 OK`
```json
{
  "message": "star toggled"
}
```

---

### Rename File
Rename a file.

**Endpoint:** `PUT /api/files/{id}/rename`

**Request Body:**
```json
{
  "new_name": "renamed_document.pdf"
}
```

**Response:** `200 OK`
```json
{
  "message": "file renamed successfully"
}
```

---

### Get Recent Files
Get 20 most recently accessed files.

**Endpoint:** `GET /api/files/recent`

**Response:** `200 OK` (Array of files)

---

### Get Starred Files
Get all starred files.

**Endpoint:** `GET /api/files/starred`

**Response:** `200 OK` (Array of files)

---

### Get Trashed Files
Get all files in trash.

**Endpoint:** `GET /api/files/trash`

**Response:** `200 OK` (Array of files)

---

### Search Files
Full-text search for files.

**Endpoint:** `GET /api/files/search`

**Query Parameters:**
- `q`: Search query (required)

**Response:** `200 OK` (Array of files, max 50)

**Example:** `GET /api/files/search?q=invoice`

---

## Folder Endpoints

### List Folders
Get folders in a parent folder (or root).

**Endpoint:** `GET /api/folders`

**Query Parameters:**
- `parent_id` (optional): UUID of parent folder

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Documents",
    "owner_id": "uuid",
    "parent_folder_id": null,
    "is_root": false,
    "status": "active",
    "is_starred": false,
    "created_at": "2025-11-02T00:00:00Z",
    "updated_at": "2025-11-02T00:00:00Z"
  }
]
```

---

### Create Folder
Create a new folder.

**Endpoint:** `POST /api/folders`

**Request Body:**
```json
{
  "name": "My Folder",
  "parent_folder_id": "uuid"  // optional
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "My Folder",
  ...
}
```

---

### Get Root Folder
Get user's root "My Drive" folder.

**Endpoint:** `GET /api/folders/root`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "My Drive",
  "is_root": true,
  ...
}
```

---

### Rename Folder
Rename a folder.

**Endpoint:** `PUT /api/folders/{id}/rename`

**Request Body:**
```json
{
  "new_name": "Renamed Folder"
}
```

**Response:** `200 OK`
```json
{
  "message": "folder renamed successfully"
}
```

---

## Sharing Endpoints

### Share Item with User
Grant a user access to a file or folder.

**Endpoint:** `POST /api/sharing/share`

**Request Body:**
```json
{
  "item_type": "file",  // or "folder"
  "item_id": "uuid",
  "user_id": "uuid",
  "role": "viewer"  // "viewer", "commenter", or "editor"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "item_type": "file",
  "item_id": "uuid",
  "user_id": "uuid",
  "role": "viewer",
  "granted_by": "uuid",
  "created_at": "2025-11-02T00:00:00Z"
}
```

---

### Get Item Permissions
List all users with access to an item.

**Endpoint:** `GET /api/sharing/permissions`

**Query Parameters:**
- `item_type`: "file" or "folder" (required)
- `item_id`: UUID (required)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "item_type": "file",
    "item_id": "uuid",
    "user_id": "uuid",
    "role": "editor",
    "granted_by": "uuid",
    "created_at": "2025-11-02T00:00:00Z",
    "email": "collaborator@example.com",
    "user_name": "Jane Smith"
  }
]
```

---

### Revoke Permission
Remove user access to an item.

**Endpoint:** `POST /api/sharing/revoke`

**Request Body:**
```json
{
  "item_type": "file",
  "item_id": "uuid",
  "user_id": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "message": "permission revoked successfully"
}
```

---

### Create Share Link
Generate a shareable link.

**Endpoint:** `POST /api/sharing/link`

**Request Body:**
```json
{
  "item_type": "file",
  "item_id": "uuid",
  "permission": "viewer",  // "viewer", "commenter", or "editor"
  "expires_in": 168  // optional: hours until expiration
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "item_type": "file",
  "item_id": "uuid",
  "token": "random_token_here",
  "created_by": "uuid",
  "permission": "viewer",
  "expires_at": null,
  "is_active": true,
  "created_at": "2025-11-02T00:00:00Z"
}
```

**Share URL Format:** `http://localhost:5173/shared/{token}`

---

### Get Share Links
List all active share links for an item.

**Endpoint:** `GET /api/sharing/links`

**Query Parameters:**
- `item_type`: "file" or "folder" (required)
- `item_id`: UUID (required)

**Response:** `200 OK` (Array of share links)

---

### Deactivate Share Link
Disable a share link.

**Endpoint:** `DELETE /api/sharing/link/{id}`

**Response:** `200 OK`
```json
{
  "message": "share link deactivated successfully"
}
```

---

### Get Shared With Me
Get all files and folders shared with the current user.

**Endpoint:** `GET /api/sharing/shared-with-me`

**Response:** `200 OK`
```json
{
  "files": [ ... ],
  "folders": [ ... ]
}
```

---

## Health Check

### Server Health
Check if server is running.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```
OK
```

---

## Error Responses

All endpoints return errors in this format:

**Response:** `4xx` or `5xx`
```json
{
  "error": "error message here"
}
```

**Common Status Codes:**
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing or invalid token
- `403` Forbidden - No permission to access resource
- `404` Not Found - Resource doesn't exist
- `500` Internal Server Error - Server error

---

## Database Schema

### Enums
- **file_status:** active, trashed, deleted
- **permission_role:** viewer, commenter, editor, owner
- **item_type:** file, folder
- **activity_type:** upload, delete, restore, share, unshare, rename, move, comment, download, star, unstar

### Tables
- **users** - User accounts
- **sessions** - Authentication sessions (30-day expiry)
- **files** - File metadata
- **folders** - Folder structure (nested, polymorphic)
- **permissions** - User access control (polymorphic: files + folders)
- **shares** - Public share links (polymorphic: files + folders)
- **file_versions** - Version history
- **activity_log** - User activity timeline

---

## Notes

### Storage
- Files stored at: `storage/uploads/user_{uuid}/{file_uuid}/v{version}_{filename}`
- Thumbnails at: `storage/thumbnails/{file_uuid}.jpg`
- Max upload: 500MB
- Default quota: 15GB per user

### Security
- Passwords hashed with bcrypt (cost 10)
- Session tokens: 32-byte random hex strings
- Share link tokens: 64-byte random hex strings
- CORS enabled for: http://localhost:5173

### Features
- ✅ File upload/download with thumbnails
- ✅ Folder hierarchy (nested)
- ✅ Trash/restore (soft delete)
- ✅ Starring files/folders
- ✅ Full-text search
- ✅ Recent files tracking
- ✅ Polymorphic permissions (files + folders)
- ✅ Share links with permissions
- ✅ Activity logging
- ✅ Version history support
- ⏳ File preview (schema ready)
- ⏳ Comments (schema ready if enabled)
