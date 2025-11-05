package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shri771/gdrive/internal/database"
	"github.com/shri771/gdrive/internal/middleware"
	"github.com/shri771/gdrive/internal/services"
)

type FilesHandler struct {
	queries        *database.Queries
	storageService *services.StorageService
	db             database.DBTX
}

func NewFilesHandler(queries *database.Queries, storageService *services.StorageService, db database.DBTX) *FilesHandler {
	return &FilesHandler{
		queries:        queries,
		storageService: storageService,
		db:             db,
	}
}

// UploadFile handles file uploads
func (h *FilesHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Parse multipart form (max 500MB)
	if err := r.ParseMultipartForm(500 << 20); err != nil {
		respondWithError(w, http.StatusBadRequest, "failed to parse form")
		return
	}

	// Get file from form
	file, header, err := r.FormFile("file")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "no file provided")
		return
	}
	defer file.Close()

	// Get folder ID (optional)
	folderIDStr := r.FormValue("folder_id")
	var folderID pgtype.UUID
	if folderIDStr != "" {
		parsedUUID, err := uuid.Parse(folderIDStr)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "invalid folder_id")
			return
		}
		folderID = pgtype.UUID{Bytes: parsedUUID, Valid: true}
	}

	// Determine if preview is available (simple check)
	mimeType := header.Header.Get("Content-Type")
	previewAvailable := false
	if mimeType == "application/pdf" || (len(mimeType) >= 6 && mimeType[:6] == "image/") {
		previewAvailable = true
	}

	// Check if file with same name exists in the same folder
	existingFile, err := h.queries.GetFileByNameAndFolder(r.Context(), database.GetFileByNameAndFolderParams{
		OwnerID:        session.UserID,
		Name:           header.Filename,
		ParentFolderID: folderID,
	})

	var dbFile database.File
	var versionNumber int32 = 1
	var fileID uuid.UUID
	fileExists := err == nil

	if fileExists {
		// File exists - create new version
		dbFile = existingFile
		fileID = uuid.UUID(dbFile.ID.Bytes)

		// Get latest version number
		latestVersionRaw, err := h.queries.GetLatestVersionNumber(r.Context(), dbFile.ID)
		if err != nil {
			// If no versions exist, start at 1
			versionNumber = 1
		} else {
			// Type assert the result (it's an int64 from PostgreSQL)
			if latestVersion, ok := latestVersionRaw.(int64); ok {
				versionNumber = int32(latestVersion) + 1
			} else if latestVersion, ok := latestVersionRaw.(int32); ok {
				versionNumber = latestVersion + 1
			} else {
				versionNumber = 1
			}
		}
	} else {
		// New file - create new record
		fileID = uuid.New()
	}

	// Save file to storage
	storagePath, err := h.storageService.SaveFile(
		uuid.UUID(session.UserID.Bytes),
		fileID,
		file,
		header.Filename,
		int(versionNumber),
	)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("failed to save file: %v", err))
		return
	}

	// Generate thumbnail if it's an image
	var thumbnailPath pgtype.Text
	if len(mimeType) >= 6 && mimeType[:6] == "image/" {
		thumbPath, err := h.storageService.GenerateThumbnail(storagePath, mimeType, fileID)
		if err != nil {
			// Log error but don't fail the upload
			fmt.Printf("failed to generate thumbnail: %v\n", err)
		} else {
			thumbnailPath = pgtype.Text{String: thumbPath, Valid: true}
		}
	}

	// Create or update file record in database
	if fileExists {
		// Update existing file with new version
		err = h.queries.UpdateFileStorageAndVersion(r.Context(), database.UpdateFileStorageAndVersionParams{
			ID:               dbFile.ID,
			StoragePath:      storagePath,
			Size:             header.Size,
			MimeType:         mimeType,
			Version:           pgtype.Int4{Int32: versionNumber, Valid: true},
			CurrentVersionID: pgtype.UUID{Valid: false}, // Will be set after creating version
		})
		if err != nil {
			h.storageService.DeleteFile(storagePath)
			respondWithError(w, http.StatusInternalServerError, "failed to update file record")
			return
		}
	} else {
		// Create new file record
		dbFile, err = h.queries.CreateFile(r.Context(), database.CreateFileParams{
			Name:             header.Filename,
			OriginalName:     header.Filename,
			MimeType:         mimeType,
			Size:             header.Size,
			StoragePath:      storagePath,
			OwnerID:          session.UserID,
			ParentFolderID:   folderID,
			PreviewAvailable: pgtype.Bool{Bool: previewAvailable, Valid: true},
			ThumbnailPath:    thumbnailPath,
		})
		if err != nil {
			// Cleanup: delete the uploaded file
			h.storageService.DeleteFile(storagePath)
			respondWithError(w, http.StatusInternalServerError, "failed to create file record")
			return
		}
	}

	// Create version record
	versionRecord, err := h.queries.CreateFileVersion(r.Context(), database.CreateFileVersionParams{
		FileID:        dbFile.ID,
		VersionNumber: versionNumber,
		StoragePath:   storagePath,
		Size:          header.Size,
		UploadedBy:    session.UserID,
	})
	if err != nil {
		fmt.Printf("failed to create version record: %v\n", err)
	} else {
		// Update current_version_id if it's a new version
		if fileExists {
			err = h.queries.UpdateFileStorageAndVersion(r.Context(), database.UpdateFileStorageAndVersionParams{
				ID:               dbFile.ID,
				StoragePath:      storagePath,
				Size:             header.Size,
				MimeType:         mimeType,
				Version:           pgtype.Int4{Int32: versionNumber, Valid: true},
				CurrentVersionID: versionRecord.ID,
			})
			if err != nil {
				fmt.Printf("failed to update current_version_id: %v\n", err)
			}
		}
	}

	// Update user storage
	if err := h.queries.UpdateUserStorage(r.Context(), database.UpdateUserStorageParams{
		ID:          session.UserID,
		StorageUsed: pgtype.Int8{Int64: header.Size, Valid: true},
	}); err != nil {
		// Log error but don't fail the request
		fmt.Printf("failed to update storage: %v\n", err)
	}

	// Log activity
	h.queries.LogActivity(r.Context(), database.LogActivityParams{
		UserID:       session.UserID,
		FileID:       dbFile.ID,
		ActivityType: database.ActivityTypeUpload,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dbFile)
}

// GetFiles returns files in a folder or root files
func (h *FilesHandler) GetFiles(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := r.URL.Query().Get("folder_id")

	var files []database.File
	var err error

	if folderIDStr == "" {
		// Get root files (files with no parent folder)
		files, err = h.queries.GetRootFiles(r.Context(), session.UserID)
	} else {
		folderID, parseErr := uuid.Parse(folderIDStr)
		if parseErr != nil {
			respondWithError(w, http.StatusBadRequest, "invalid folder_id")
			return
		}
		files, err = h.queries.GetFilesByFolder(r.Context(), database.GetFilesByFolderParams{
			OwnerID:        session.UserID,
			ParentFolderID: pgtype.UUID{Bytes: folderID, Valid: true},
		})
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get files")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

// GetRecentFiles returns recently accessed files
func (h *FilesHandler) GetRecentFiles(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	files, err := h.queries.GetRecentFiles(r.Context(), database.GetRecentFilesParams{
		OwnerID: session.UserID,
		Limit:   20,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get recent files")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

// GetStarredFiles returns starred files
func (h *FilesHandler) GetStarredFiles(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	files, err := h.queries.GetStarredFiles(r.Context(), session.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get starred files")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

// GetTrashedFiles returns trashed files
func (h *FilesHandler) GetTrashedFiles(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	files, err := h.queries.GetTrashedFiles(r.Context(), session.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get trashed files")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

// DownloadFile streams a file for download
func (h *FilesHandler) DownloadFile(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "id")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Get file from database
	dbFile, err := h.queries.GetFileByID(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	// Check ownership
	if dbFile.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Open file from storage
	file, err := h.storageService.GetFile(dbFile.StoragePath)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to open file")
		return
	}
	defer file.Close()

	// Update last accessed
	h.queries.UpdateLastAccessed(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})

	// Set headers for download
	w.Header().Set("Content-Type", dbFile.MimeType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", dbFile.Name))
	w.Header().Set("Content-Length", strconv.FormatInt(dbFile.Size, 10))

	// Stream file
	io.Copy(w, file)
}

// DeleteFile moves a file to trash
func (h *FilesHandler) DeleteFile(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "id")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Get file to check ownership
	dbFile, err := h.queries.GetFileByID(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	if dbFile.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Move to trash
	if err := h.queries.TrashFile(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to delete file")
		return
	}

	// Log activity
	h.queries.LogActivity(r.Context(), database.LogActivityParams{
		UserID:       session.UserID,
		FileID:       pgtype.UUID{Bytes: fileID, Valid: true},
		ActivityType: database.ActivityTypeDelete,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "file moved to trash",
	})
}

// RestoreFile restores a file from trash
func (h *FilesHandler) RestoreFile(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "id")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Get file to check ownership (can be trashed)
	dbFile, err := h.queries.GetFileByIDAnyStatus(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	if dbFile.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Restore file
	if err := h.queries.RestoreFile(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to restore file")
		return
	}

	// Log activity
	h.queries.LogActivity(r.Context(), database.LogActivityParams{
		UserID:       session.UserID,
		FileID:       pgtype.UUID{Bytes: fileID, Valid: true},
		ActivityType: database.ActivityTypeRestore,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "file restored",
	})
}

// PermanentDeleteFile permanently deletes a file
func (h *FilesHandler) PermanentDeleteFile(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "id")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Get file to verify ownership before permanent deletion (can be trashed)
	dbFile, err := h.queries.GetFileByIDAnyStatus(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	if dbFile.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Permanently delete file
	if err := h.queries.PermanentDeleteFile(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to permanently delete file")
		return
	}

	// Note: Could also delete physical file from storage here
	// if needed: h.storageService.DeleteFile(dbFile.StoragePath)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "file permanently deleted",
	})
}

// ToggleStar toggles the starred status of a file
func (h *FilesHandler) ToggleStar(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "id")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Toggle star
	if err := h.queries.ToggleStarFile(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to toggle star")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "star toggled",
	})
}

// SearchFiles searches files with advanced filters
func (h *FilesHandler) SearchFiles(w http.ResponseWriter, r *http.Request) {
	session, _ := middleware.GetUserFromContext(r.Context())

	// Parse query parameters
	query := r.URL.Query().Get("q")
	fileType := r.URL.Query().Get("fileType")
	owner := r.URL.Query().Get("owner")
	folderId := r.URL.Query().Get("folderId")
	dateModifiedType := r.URL.Query().Get("dateModifiedType")
	dateModifiedStart := r.URL.Query().Get("dateModifiedStart")
	dateModifiedEnd := r.URL.Query().Get("dateModifiedEnd")
	isStarred := r.URL.Query().Get("isStarred")
	status := r.URL.Query().Get("status")
	if status == "" {
		status = "active"
	}

	// Build dynamic query
	sqlQuery := `SELECT * FROM files WHERE 1=1`
	args := []interface{}{}
	argCount := 1

	// Owner filter
	if owner == "me" || owner == "" || owner == "anyone" {
		sqlQuery += fmt.Sprintf(" AND owner_id = $%d", argCount)
		args = append(args, session.UserID)
		argCount++
	}

	// Text search
	if query != "" {
		sqlQuery += fmt.Sprintf(" AND to_tsvector('english', name) @@ plainto_tsquery('english', $%d)", argCount)
		args = append(args, query)
		argCount++
	}

	// File type filter
	if fileType != "" && fileType != "folder" {
		mimePattern := getMimeTypePattern(fileType)
		if mimePattern != "" {
			sqlQuery += fmt.Sprintf(" AND mime_type LIKE $%d", argCount)
			args = append(args, mimePattern+"%")
			argCount++
		}
	}

	// Folder filter
	if folderId != "" {
		folderUUID, err := uuid.Parse(folderId)
		if err == nil {
			sqlQuery += fmt.Sprintf(" AND parent_folder_id = $%d", argCount)
			args = append(args, folderUUID)
			argCount++
		}
	}

	// Date modified filter
	if dateModifiedType != "" {
		dateFilter := getDateFilter(dateModifiedType, dateModifiedStart, dateModifiedEnd)
		if dateFilter != "" {
			sqlQuery += " AND " + dateFilter
		}
	}

	// Starred filter
	if isStarred == "true" {
		sqlQuery += " AND is_starred = TRUE"
	} else if isStarred == "false" {
		sqlQuery += " AND is_starred = FALSE"
	}

	// Status filter
	if status != "" && status != "all" {
		sqlQuery += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		argCount++
	}

	sqlQuery += " ORDER BY updated_at DESC LIMIT 100"

	// Search response structure
	type SearchResponse struct {
		Files   []database.File   `json:"files"`
		Folders []database.Folder `json:"folders"`
	}

	response := SearchResponse{
		Files:   []database.File{},
		Folders: []database.Folder{},
	}

	// Search files (if not exclusively searching for folders)
	if fileType != "folder" {
		rows, err := h.db.Query(r.Context(), sqlQuery, args...)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "failed to search files")
			return
		}
		defer rows.Close()

		for rows.Next() {
			var file database.File
			err := rows.Scan(
				&file.ID, &file.Name, &file.OriginalName, &file.MimeType,
				&file.Size, &file.StoragePath, &file.OwnerID, &file.ParentFolderID,
				&file.Status, &file.IsStarred, &file.ThumbnailPath, &file.PreviewAvailable,
				&file.Version, &file.CurrentVersionID, &file.CreatedAt, &file.UpdatedAt,
				&file.TrashedAt, &file.LastAccessedAt,
			)
			if err != nil {
				respondWithError(w, http.StatusInternalServerError, "failed to parse file results")
				return
			}
			response.Files = append(response.Files, file)
		}
	}

	// Search folders (if fileType is "folder" or not specified)
	if fileType == "" || fileType == "folder" {
		folderQuery := `SELECT * FROM folders WHERE 1=1`
		folderArgs := []interface{}{}
		folderArgCount := 1

		// Owner filter
		if owner == "me" || owner == "" || owner == "anyone" {
			folderQuery += fmt.Sprintf(" AND owner_id = $%d", folderArgCount)
			folderArgs = append(folderArgs, session.UserID)
			folderArgCount++
		}

		// Text search
		if query != "" {
			folderQuery += fmt.Sprintf(" AND to_tsvector('english', name) @@ plainto_tsquery('english', $%d)", folderArgCount)
			folderArgs = append(folderArgs, query)
			folderArgCount++
		}

		// Folder location filter
		if folderId != "" {
			folderUUID, err := uuid.Parse(folderId)
			if err == nil {
				folderQuery += fmt.Sprintf(" AND parent_folder_id = $%d", folderArgCount)
				folderArgs = append(folderArgs, folderUUID)
				folderArgCount++
			}
		}

		// Date modified filter
		if dateModifiedType != "" {
			dateFilter := getDateFilter(dateModifiedType, dateModifiedStart, dateModifiedEnd)
			if dateFilter != "" {
				folderQuery += " AND " + dateFilter
			}
		}

		// Starred filter
		if isStarred == "true" {
			folderQuery += " AND is_starred = TRUE"
		} else if isStarred == "false" {
			folderQuery += " AND is_starred = FALSE"
		}

		// Status filter
		if status != "" && status != "all" {
			folderQuery += fmt.Sprintf(" AND status = $%d", folderArgCount)
			folderArgs = append(folderArgs, status)
			folderArgCount++
		}

		folderQuery += " AND is_root = FALSE ORDER BY updated_at DESC LIMIT 100"

		folderRows, err := h.db.Query(r.Context(), folderQuery, folderArgs...)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "failed to search folders")
			return
		}
		defer folderRows.Close()

		for folderRows.Next() {
			var folder database.Folder
			err := folderRows.Scan(
				&folder.ID, &folder.Name, &folder.OwnerID, &folder.ParentFolderID,
				&folder.IsRoot, &folder.Status, &folder.IsStarred,
				&folder.CreatedAt, &folder.UpdatedAt, &folder.TrashedAt,
			)
			if err != nil {
				respondWithError(w, http.StatusInternalServerError, "failed to parse folder results")
				return
			}
			response.Folders = append(response.Folders, folder)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// getMimeTypePattern returns MIME type pattern for file type
func getMimeTypePattern(fileType string) string {
	patterns := map[string]string{
		"image":       "image/",
		"video":       "video/",
		"audio":       "audio/",
		"pdf":         "application/pdf",
		"document":    "application/vnd.openxmlformats-officedocument.wordprocessingml",
		"spreadsheet": "application/vnd.openxmlformats-officedocument.spreadsheetml",
		"archive":     "application/zip",
	}
	return patterns[fileType]
}

// getDateFilter returns SQL date filter based on type
func getDateFilter(dateType, startDate, endDate string) string {
	switch dateType {
	case "today":
		return "updated_at >= CURRENT_DATE"
	case "yesterday":
		return "updated_at >= CURRENT_DATE - INTERVAL '1 day' AND updated_at < CURRENT_DATE"
	case "last7days":
		return "updated_at >= CURRENT_DATE - INTERVAL '7 days'"
	case "last30days":
		return "updated_at >= CURRENT_DATE - INTERVAL '30 days'"
	case "thisYear":
		return "updated_at >= DATE_TRUNC('year', CURRENT_DATE)"
	case "custom":
		if startDate != "" && endDate != "" {
			return fmt.Sprintf("updated_at >= '%s' AND updated_at <= '%s'", startDate, endDate)
		}
	}
	return ""
}

type RenameFileRequest struct {
	NewName string `json:"new_name"`
}

type MoveFileRequest struct {
	FolderID string `json:"folder_id"` // Can be empty for root
}

// RenameFile renames a file
func (h *FilesHandler) RenameFile(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "id")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	var req RenameFileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.NewName == "" {
		respondWithError(w, http.StatusBadRequest, "new name is required")
		return
	}

	// Get file to check ownership
	dbFile, err := h.queries.GetFileByID(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	if dbFile.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Rename file in database
	if err := h.queries.RenameFile(r.Context(), database.RenameFileParams{
		ID:   pgtype.UUID{Bytes: fileID, Valid: true},
		Name: req.NewName,
	}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to rename file")
		return
	}

	// Log activity
	h.queries.LogActivity(r.Context(), database.LogActivityParams{
		UserID:       session.UserID,
		FileID:       pgtype.UUID{Bytes: fileID, Valid: true},
		ActivityType: database.ActivityTypeRename,
		Details:      json.RawMessage(fmt.Sprintf(`{"old_name": "%s", "new_name": "%s"}`, dbFile.Name, req.NewName)),
	})

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "file renamed successfully",
	})
}

// MoveFile moves a file to a different folder
func (h *FilesHandler) MoveFile(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "id")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	var req MoveFileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Get file to check ownership
	dbFile, err := h.queries.GetFileByID(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	if dbFile.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Parse folder ID
	var folderID pgtype.UUID
	if req.FolderID != "" {
		parsedUUID, err := uuid.Parse(req.FolderID)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "invalid folder_id")
			return
		}
		folderID = pgtype.UUID{Bytes: parsedUUID, Valid: true}

		// Verify folder exists and user owns it
		folder, err := h.queries.GetFolderByID(r.Context(), folderID)
		if err != nil {
			respondWithError(w, http.StatusNotFound, "folder not found")
			return
		}
		if folder.OwnerID != session.UserID {
			respondWithError(w, http.StatusForbidden, "forbidden")
			return
		}
	} else {
		folderID = pgtype.UUID{Valid: false} // Move to root
	}

	// Move file in database
	if err := h.queries.MoveFile(r.Context(), database.MoveFileParams{
		ID:             pgtype.UUID{Bytes: fileID, Valid: true},
		ParentFolderID: folderID,
	}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to move file")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "file moved successfully",
	})
}

// GetThumbnail serves a file thumbnail
func (h *FilesHandler) GetThumbnail(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "id")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Get file from database
	dbFile, err := h.queries.GetFileByID(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	// Check if thumbnail exists
	if !dbFile.ThumbnailPath.Valid || dbFile.ThumbnailPath.String == "" {
		respondWithError(w, http.StatusNotFound, "thumbnail not available")
		return
	}

	// Open thumbnail from storage
	thumbnailPath := dbFile.ThumbnailPath.String
	file, err := h.storageService.GetFile(thumbnailPath)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to open thumbnail")
		return
	}
	defer file.Close()

	// Set headers for thumbnail
	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("Cache-Control", "public, max-age=31536000")

	// Stream thumbnail
	io.Copy(w, file)
}