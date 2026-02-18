package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shri771/gdrive/internal/database"
	"github.com/shri771/gdrive/internal/middleware"
)

type FoldersHandler struct {
	queries *database.Queries
}

func NewFoldersHandler(queries *database.Queries) *FoldersHandler {
	return &FoldersHandler{
		queries: queries,
	}
}

type CreateFolderRequest struct {
	Name           string `json:"name"`
	ParentFolderID string `json:"parent_folder_id,omitempty"`
}

// CreateFolder creates a new folder
func (h *FoldersHandler) CreateFolder(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateFolderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "folder name is required")
		return
	}

	var parentFolderID pgtype.UUID
	if req.ParentFolderID != "" {
		parsedUUID, err := uuid.Parse(req.ParentFolderID)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "invalid parent_folder_id")
			return
		}
		parentFolderID = pgtype.UUID{Bytes: parsedUUID, Valid: true}
	}

	folder, err := h.queries.CreateFolder(r.Context(), database.CreateFolderParams{
		Name:           req.Name,
		OwnerID:        session.UserID,
		ParentFolderID: parentFolderID,
		IsRoot:         pgtype.Bool{Bool: false, Valid: true},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to create folder")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folder)
}

// GetFolders returns subfolders of a folder
func (h *FoldersHandler) GetFolders(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := r.URL.Query().Get("parent_id")

	var folders []database.Folder
	var err error

	if folderIDStr == "" {
		// Get root folders (folders with no parent, excluding the root "My Drive" folder)
		folders, err = h.queries.GetRootFolders(r.Context(), session.UserID)
	} else {
		folderID, parseErr := uuid.Parse(folderIDStr)
		if parseErr != nil {
			respondWithError(w, http.StatusBadRequest, "invalid folder_id")
			return
		}
		folders, err = h.queries.GetSubfolders(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true})
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get folders")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folders)
}

// GetRootFolder returns the user's root folder
func (h *FoldersHandler) GetRootFolder(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folder, err := h.queries.GetRootFolder(r.Context(), session.UserID)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "root folder not found")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folder)
}

// GetFolderByIDHandler returns a specific folder by ID
func (h *FoldersHandler) GetFolderByIDHandler(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := chi.URLParam(r, "id")
	folderID, err := uuid.Parse(folderIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid folder ID")
		return
	}

	folder, err := h.queries.GetFolderByID(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "folder not found")
		return
	}

	if folder.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folder)
}

type RenameFolderRequest struct {
	NewName string `json:"new_name"`
}

type MoveFolderRequest struct {
	ParentFolderID string `json:"parent_folder_id"` // Can be empty for root
}

// RenameFolder renames a folder
func (h *FoldersHandler) RenameFolder(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := chi.URLParam(r, "id")
	folderID, err := uuid.Parse(folderIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid folder ID")
		return
	}

	var req RenameFolderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.NewName == "" {
		respondWithError(w, http.StatusBadRequest, "new name is required")
		return
	}

	// Get folder to check ownership
	dbFolder, err := h.queries.GetFolderByID(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "folder not found")
		return
	}

	if dbFolder.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Rename folder in database
	if err := h.queries.RenameFolder(r.Context(), database.RenameFolderParams{
		ID:   pgtype.UUID{Bytes: folderID, Valid: true},
		Name: req.NewName,
	}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to rename folder")
		return
	}

	// Note: Activity logging for folders is not yet implemented in the schema

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "folder renamed successfully",
	})
}

// MoveFolder moves a folder to a different parent folder
func (h *FoldersHandler) MoveFolder(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := chi.URLParam(r, "id")
	folderID, err := uuid.Parse(folderIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid folder ID")
		return
	}

	var req MoveFolderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Get folder to check ownership
	dbFolder, err := h.queries.GetFolderByID(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "folder not found")
		return
	}

	if dbFolder.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Can't move root folder
	if dbFolder.IsRoot.Bool {
		respondWithError(w, http.StatusBadRequest, "cannot move root folder")
		return
	}

	// Parse parent folder ID
	var parentFolderID pgtype.UUID
	if req.ParentFolderID != "" {
		parsedUUID, err := uuid.Parse(req.ParentFolderID)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "invalid parent_folder_id")
			return
		}
		parentFolderID = pgtype.UUID{Bytes: parsedUUID, Valid: true}

		// Verify parent folder exists and user owns it
		parentFolder, err := h.queries.GetFolderByID(r.Context(), parentFolderID)
		if err != nil {
			respondWithError(w, http.StatusNotFound, "parent folder not found")
			return
		}
		if parentFolder.OwnerID != session.UserID {
			respondWithError(w, http.StatusForbidden, "forbidden")
			return
		}

		// Can't move folder into itself
		if parsedUUID == folderID {
			respondWithError(w, http.StatusBadRequest, "cannot move folder into itself")
			return
		}
	} else {
		parentFolderID = pgtype.UUID{Valid: false} // Move to root
	}

	// Move folder in database
	if err := h.queries.MoveFolder(r.Context(), database.MoveFolderParams{
		ID:             pgtype.UUID{Bytes: folderID, Valid: true},
		ParentFolderID: parentFolderID,
	}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to move folder")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "folder moved successfully",
	})
}

// GetStarredFolders returns starred folders
func (h *FoldersHandler) GetStarredFolders(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folders, err := h.queries.GetStarredFolders(r.Context(), session.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get starred folders")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folders)
}

// ToggleStarFolder toggles the starred status of a folder
func (h *FoldersHandler) ToggleStarFolder(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := chi.URLParam(r, "id")
	folderID, err := uuid.Parse(folderIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid folder ID")
		return
	}

	// Get folder to check ownership
	dbFolder, err := h.queries.GetFolderByID(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "folder not found")
		return
	}

	if dbFolder.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Toggle star
	if err := h.queries.ToggleStarFolder(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to toggle star")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "star toggled",
	})
}

// DeleteFolder moves a folder to trash
func (h *FoldersHandler) DeleteFolder(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := chi.URLParam(r, "id")
	folderID, err := uuid.Parse(folderIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid folder ID")
		return
	}

	// Get folder to check ownership
	dbFolder, err := h.queries.GetFolderByID(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "folder not found")
		return
	}

	if dbFolder.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Can't delete root folder
	if dbFolder.IsRoot.Bool {
		respondWithError(w, http.StatusBadRequest, "cannot delete root folder")
		return
	}

	// Trash folder
	if err := h.queries.TrashFolder(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to trash folder")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "folder moved to trash",
	})
}

// RestoreFolder restores a folder from trash
func (h *FoldersHandler) RestoreFolder(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := chi.URLParam(r, "id")
	folderID, err := uuid.Parse(folderIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid folder ID")
		return
	}

	// Get folder to check ownership (can be trashed)
	dbFolder, err := h.queries.GetFolderByIDAnyStatus(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "folder not found")
		return
	}

	if dbFolder.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Restore folder
	if err := h.queries.RestoreFolder(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to restore folder")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "folder restored",
	})
}

// GetTrashedFolders returns trashed folders
func (h *FoldersHandler) GetTrashedFolders(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folders, err := h.queries.GetTrashedFolders(r.Context(), session.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get trashed folders")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folders)
}

// PermanentDeleteFolder permanently deletes a folder
func (h *FoldersHandler) PermanentDeleteFolder(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	folderIDStr := chi.URLParam(r, "id")
	folderID, err := uuid.Parse(folderIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid folder ID")
		return
	}

	// Get folder to check ownership (can be trashed)
	dbFolder, err := h.queries.GetFolderByIDAnyStatus(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "folder not found")
		return
	}

	if dbFolder.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Permanently delete folder
	if err := h.queries.PermanentDeleteFolder(r.Context(), pgtype.UUID{Bytes: folderID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to permanently delete folder")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "folder permanently deleted",
	})
}