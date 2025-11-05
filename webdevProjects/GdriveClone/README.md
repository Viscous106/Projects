A full-stack Google Drive clone with **Go REST API** + **React Frontend** + **PostgreSQL**

![Tech Stack](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
# Team Code Raiders - Google Drive Clone

## Scaler Hackathon Project

## 🚀 Getting Started with Docker Compose

This project can be easily set up and run using Docker Compose. This will start the backend API, the PostgreSQL database, and the React frontend.

### Prerequisites

*   Docker and Docker Compose installed on your system.

### Steps

1.  **Clone the repository:**
    ```bash
    git https://github.com/shri771/gdrive
    cd gdrive
    ```

2.  **Start the application:**
    ```bash
    docker compose up -d --build
    ```
    This command will:
    *   Build the Docker images for the backend API and the PostgreSQL database.
    *   Start the PostgreSQL database container.
    *   Run database migrations to set up the schema.
    *   Load initial data (including a dummy user).
    *   Start the backend API container.
    *   Start the React frontend development server.

3.  **Access the application:**
    *   **Frontend:** Open your web browser and navigate to `http://localhost:1573`
    *   **Backend API:** The API will be running on `http://localhost:1030`

### Dummy Account

For quick testing, you can use the following dummy account:

*   **Email:** `tst@g`
*   **Password:** `shrikant`

---


---

## 🏗️ Project Status: FULLY COMPLETE ✅

### ✅ What's Built and Working

**Backend (Go - Port 1030):**
- ✅ PostgreSQL database with complete schema (10 tables)
- ✅ Type-safe SQL queries (SQLC)
- ✅ Complete REST API with all features
- ✅ File storage service with thumbnails
- ✅ CORS enabled for React frontend
- ✅ JWT-based authentication
- ✅ Advanced features: sharing, comments, versions, activity logs

**Frontend (React + Vite - Port 5173):**
- ✅ Complete Google Drive UI replica
- ✅ React Router setup with all views
- ✅ Full Dashboard with file/folder management
- ✅ Drag & drop file uploads
- ✅ File sharing dialog
- ✅ Comments panel
- ✅ Version history viewer
- ✅ Storage analytics
- ✅ Context menus
- ✅ File preview/viewer
- ✅ Advanced search

---

## 🚀 Quick Start

### 1. Start Backend
```bash
# From project root
go run cmd/server/main.go
```
**Backend runs on:** http://localhost:1030

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
**Frontend runs on:** http://localhost:5173

---

## ✨ Features Implemented

### Core Features
- 🔐 User registration and authentication (JWT)
- 📁 File upload, download, rename, delete
- 📂 Folder creation with nested hierarchy
- 🎯 Drag & drop file uploads
- ⭐ Star files and folders
- 🗑️ Trash with restore functionality
- 🔍 Advanced search with filters
- 📊 Storage usage analytics

### Advanced Features
- 👥 File sharing with users (viewer/editor roles)
- 🔗 Public share link generation
- 📝 File comments
- 🕐 Version history tracking
- 📈 Activity logs
- 🖼️ Automatic thumbnail generation
- 🎨 File preview/viewer
- 📱 Responsive UI (Google Drive clone)

### UI Components
- Complete Dashboard matching Google Drive layout
- Header with search, settings, profile
- Sidebar with My Drive, Recent, Starred, Trash
- File list table with Name, Owner, Modified, Size columns
- Grid and List view toggle
- Breadcrumb navigation
- Context menus (right-click)
- Share dialog
- Comments panel
- Version history modal
- Details panel
- Storage analytics

---

## 🔧 All API Endpoints (Backend Ready)

### Auth
- `POST /api/auth/register` - {email, password, name}
- `POST /api/auth/login` - {email, password}
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Files
- `GET /api/files` - List files (query: ?folder_id=uuid)
- `POST /api/files/upload` - Upload (multipart/form-data)
- `GET /api/files/recent` - Recent files
- `GET /api/files/starred` - Starred files
- `GET /api/files/trash` - Trashed files
- `GET /api/files/search?q=query` - Search files
- `GET /api/files/{id}/download` - Download file
- `GET /api/files/{id}/thumbnail` - Get thumbnail
- `PUT /api/files/{id}/rename` - Rename file
- `PUT /api/files/{id}/move` - Move to folder
- `DELETE /api/files/{id}` - Move to trash
- `POST /api/files/{id}/restore` - Restore from trash
- `DELETE /api/files/{id}/permanent` - Permanent delete
- `POST /api/files/{id}/star` - Toggle star

### Folders
- `GET /api/folders` - List folders (query: ?parent_id=uuid)
- `POST /api/folders` - Create folder {name, parent_folder_id}
- `GET /api/folders/root` - Get root folder
- `GET /api/folders/starred` - Starred folders
- `GET /api/folders/trash` - Trashed folders
- `GET /api/folders/{id}` - Get folder details
- `PUT /api/folders/{id}/rename` - Rename folder
- `PUT /api/folders/{id}/move` - Move folder
- `POST /api/folders/{id}/star` - Toggle star
- `DELETE /api/folders/{id}` - Move to trash
- `POST /api/folders/{id}/restore` - Restore
- `DELETE /api/folders/{id}/permanent` - Permanent delete

### Sharing
- `POST /api/sharing/share` - Share with user
- `GET /api/sharing/permissions` - Get permissions
- `POST /api/sharing/revoke` - Revoke permission
- `POST /api/sharing/link` - Create share link
- `GET /api/sharing/links` - Get share links
- `DELETE /api/sharing/link/{id}` - Deactivate link
- `GET /api/sharing/shared-with-me` - Items shared with me

### Advanced Features
- `GET /api/versions/file/{fileId}` - File versions
- `GET /api/activity` - User activity
- `GET /api/activity/file` - File activity
- `POST /api/comments` - Create comment
- `GET /api/comments` - Get file comments
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment
- `GET /api/storage/analytics` - Storage analytics

---

## 📦 Tech Stack

**Backend:**
- Go 1.21+
- Chi (router)
- PostgreSQL 18
- sqlc (type-safe SQL)
- Goose (migrations)
- bcrypt (password hashing)

**Frontend:**
- React 18
- Vite
- React Router
- Axios
- react-dropzone
- lucide-react (icons)

---

## 🎯 Hackathon Demo Flow

1. Register new user
2. Upload files (drag & drop)
3. Download files
4. Star files → show starred view
5. Delete → show trash → restore
6. Search files

---

## ⚡ Commands Cheat Sheet

```bash
# Backend
go run cmd/server/main.go        # Start server (port 1030)
make migrate-up                    # Run database migrations
make sqlc                          # Regenerate Go code from SQL

# Frontend
cd frontend
npm run dev                        # Start dev server (port 5173)
npm run build                      # Build for production

# Database
psql -U postgres gdrive            # Connect to database
make migrate-status                # Check migration status
```

---

## 📚 Complete Documentation

This project includes comprehensive documentation:

- **[README.md](README.md)** - This file, overview and quick start
- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup, API docs, deployment
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture, database schema, design decisions

### Documentation Highlights

**QUICKSTART.md includes:**
- Step-by-step setup (5 minutes)
- Common issues and solutions
- Development tips
- Production deployment checklist

**SETUP_GUIDE.md includes:**
- Complete API endpoint documentation
- Database schema details
- Installation instructions
- Deployment guide
- Security considerations

**ARCHITECTURE.md includes:**
- System architecture diagrams
- Data flow explanations
- Database relationships
- Performance optimizations
- Scalability considerations
- Future enhancements roadmap

---

## 🎯 Demo Flow for Hackathon

1. **Registration & Login**
   - Register new user
   - Demonstrate JWT authentication

2. **File Operations**
   - Upload files (drag & drop showcase)
   - Create folder hierarchy
   - Navigate folders with breadcrumbs
   - Download files

3. **Organization**
   - Star important files
   - Search functionality
   - Grid vs List view

4. **Collaboration**
   - Share file with another user
   - Generate public share link
   - Add comments to file
   - View activity log

5. **Management**
   - Delete files (trash)
   - Restore from trash
   - View storage analytics
   - Check version history

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ CORS protection
- ✅ SQL injection prevention (SQLC type-safe queries)
- ✅ Path traversal prevention (UUID filenames)
- ✅ Role-based access control
- ✅ Session management
- ✅ File type validation

---

## 🚀 Performance Features

- Connection pooling for database
- Prepared statements
- Optimized database indexes
- Efficient queries with SQLC
- Lazy loading for thumbnails
- Streaming file downloads

---

## 🏆 Team Code Raiders - Let's win this! 🚀

### Project Achievements

- ✅ 100% feature-complete Google Drive clone
- ✅ Clean, production-ready code
- ✅ Comprehensive documentation
- ✅ Modern tech stack (Go + React + PostgreSQL)
- ✅ Advanced features (sharing, comments, versions)
- ✅ Perfect UI replication of Google Drive
- ✅ Ready for demo and deployment
