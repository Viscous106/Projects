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

type VersionsHandler struct {
	queries *database.Queries
}

func NewVersionsHandler(queries *database.Queries) *VersionsHandler {
	return &VersionsHandler{
		queries: queries,
	}
}

// GetFileVersions returns all versions of a file
func (h *VersionsHandler) GetFileVersions(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := chi.URLParam(r, "fileId")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Check if user owns the file
	file, err := h.queries.GetFileByID(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	if file.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	// Get all versions
	versions, err := h.queries.GetFileVersions(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get versions")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(versions)
}

// GetFileVersion returns a specific version of a file
func (h *VersionsHandler) GetFileVersion(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	versionIDStr := chi.URLParam(r, "versionId")
	versionID, err := uuid.Parse(versionIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid version ID")
		return
	}

	// Get version
	version, err := h.queries.GetFileVersion(r.Context(), pgtype.UUID{Bytes: versionID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "version not found")
		return
	}

	// Check if user owns the file
	file, err := h.queries.GetFileByID(r.Context(), version.FileID)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	if file.OwnerID != session.UserID {
		respondWithError(w, http.StatusForbidden, "forbidden")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(version)
}
