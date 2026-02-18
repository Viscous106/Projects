package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shri771/gdrive/internal/database"
	"github.com/shri771/gdrive/internal/middleware"
	"github.com/shri771/gdrive/internal/services"
)

type SharingHandler struct {
	queries     *database.Queries
	authService *services.AuthService
}

func NewSharingHandler(queries *database.Queries, authService *services.AuthService) *SharingHandler {
	return &SharingHandler{
		queries:     queries,
		authService: authService,
	}
}

// ShareItemRequest represents the request to share a file/folder
type ShareItemRequest struct {
	ItemType string `json:"item_type"` // "file" or "folder"
	ItemID   string `json:"item_id"`
	UserID   string `json:"user_id"`   // User to share with
	Role     string `json:"role"`      // "viewer", "commenter", "editor"
}

// ShareItem adds a user to an item's permissions
func (h *SharingHandler) ShareItem(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req ShareItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validate item type
	var itemType database.ItemType
	switch req.ItemType {
	case "file":
		itemType = database.ItemTypeFile
	case "folder":
		itemType = database.ItemTypeFolder
	default:
		respondWithError(w, http.StatusBadRequest, "invalid item_type (must be 'file' or 'folder')")
		return
	}

	// Validate role
	var role database.PermissionRole
	switch req.Role {
	case "viewer":
		role = database.PermissionRoleViewer
	case "commenter":
		role = database.PermissionRoleCommenter
	case "editor":
		role = database.PermissionRoleEditor
	default:
		respondWithError(w, http.StatusBadRequest, "invalid role (must be 'viewer', 'commenter', or 'editor')")
		return
	}

	// Parse UUIDs
	itemID, err := uuid.Parse(req.ItemID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid item_id")
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid user_id")
		return
	}

	// TODO: Verify that the current user owns the item or has permission to share it

	// Create permission
	permission, err := h.queries.CreatePermission(r.Context(), database.CreatePermissionParams{
		ItemType:  itemType,
		ItemID:    pgtype.UUID{Bytes: itemID, Valid: true},
		UserID:    pgtype.UUID{Bytes: userID, Valid: true},
		Role:      role,
		GrantedBy: session.UserID,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("failed to share item: %v", err))
		return
	}

	// Log activity
	if itemType == database.ItemTypeFile {
		h.queries.LogActivity(r.Context(), database.LogActivityParams{
			UserID:       session.UserID,
			FileID:       pgtype.UUID{Bytes: itemID, Valid: true},
			ActivityType: database.ActivityTypeShare,
			Details:      json.RawMessage(fmt.Sprintf(`{"shared_with": "%s", "role": "%s"}`, req.UserID, req.Role)),
		})
	}

	respondWithJSON(w, http.StatusOK, permission)
}

// GetItemPermissions returns all permissions for a file/folder
func (h *SharingHandler) GetItemPermissions(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	itemType := r.URL.Query().Get("item_type")
	itemID := r.URL.Query().Get("item_id")

	if itemType == "" || itemID == "" {
		respondWithError(w, http.StatusBadRequest, "item_type and item_id are required")
		return
	}

	// Validate item type
	var dbItemType database.ItemType
	switch itemType {
	case "file":
		dbItemType = database.ItemTypeFile
	case "folder":
		dbItemType = database.ItemTypeFolder
	default:
		respondWithError(w, http.StatusBadRequest, "invalid item_type")
		return
	}

	itemUUID, err := uuid.Parse(itemID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid item_id")
		return
	}

	// Get permissions
	permissions, err := h.queries.GetItemPermissions(r.Context(), database.GetItemPermissionsParams{
		ItemType: dbItemType,
		ItemID:   pgtype.UUID{Bytes: itemUUID, Valid: true},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get permissions")
		return
	}

	respondWithJSON(w, http.StatusOK, permissions)
}

// RevokePermissionRequest represents the request to revoke access
type RevokePermissionRequest struct {
	ItemType string `json:"item_type"`
	ItemID   string `json:"item_id"`
	UserID   string `json:"user_id"`
}

// RevokePermission removes a user's access to a file/folder
func (h *SharingHandler) RevokePermission(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req RevokePermissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validate item type
	var itemType database.ItemType
	switch req.ItemType {
	case "file":
		itemType = database.ItemTypeFile
	case "folder":
		itemType = database.ItemTypeFolder
	default:
		respondWithError(w, http.StatusBadRequest, "invalid item_type")
		return
	}

	// Parse UUIDs
	itemID, err := uuid.Parse(req.ItemID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid item_id")
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid user_id")
		return
	}

	// Revoke permission
	if err := h.queries.RevokePermission(r.Context(), database.RevokePermissionParams{
		ItemType: itemType,
		ItemID:   pgtype.UUID{Bytes: itemID, Valid: true},
		UserID:   pgtype.UUID{Bytes: userID, Valid: true},
	}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to revoke permission")
		return
	}

	// Log activity
	if itemType == database.ItemTypeFile {
		h.queries.LogActivity(r.Context(), database.LogActivityParams{
			UserID:       session.UserID,
			FileID:       pgtype.UUID{Bytes: itemID, Valid: true},
			ActivityType: database.ActivityTypeUnshare,
			Details:      json.RawMessage(fmt.Sprintf(`{"revoked_from": "%s"}`, req.UserID)),
		})
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "permission revoked successfully",
	})
}

// CreateShareLinkRequest represents the request to create a share link
type CreateShareLinkRequest struct {
	ItemType   string  `json:"item_type"`
	ItemID     string  `json:"item_id"`
	Permission string  `json:"permission"` // "viewer", "commenter", "editor"
	ExpiresIn  *int64  `json:"expires_in"` // Optional: hours until expiration
}

// CreateShareLink generates a shareable link for a file/folder
func (h *SharingHandler) CreateShareLink(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateShareLinkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validate item type
	var itemType database.ItemType
	switch req.ItemType {
	case "file":
		itemType = database.ItemTypeFile
	case "folder":
		itemType = database.ItemTypeFolder
	default:
		respondWithError(w, http.StatusBadRequest, "invalid item_type")
		return
	}

	// Validate permission
	var permission database.PermissionRole
	switch req.Permission {
	case "viewer":
		permission = database.PermissionRoleViewer
	case "commenter":
		permission = database.PermissionRoleCommenter
	case "editor":
		permission = database.PermissionRoleEditor
	default:
		respondWithError(w, http.StatusBadRequest, "invalid permission")
		return
	}

	// Parse item ID
	itemID, err := uuid.Parse(req.ItemID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid item_id")
		return
	}

	// Generate random token
	token, err := h.authService.GenerateRandomToken(32)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	// Calculate expiration
	var expiresAt pgtype.Timestamp
	if req.ExpiresIn != nil {
		// expiresAt = time.Now().Add(time.Duration(*req.ExpiresIn) * time.Hour)
		// For now, we'll leave it null (no expiration)
	}

	// Create share link
	shareLink, err := h.queries.CreateShare(r.Context(), database.CreateShareParams{
		ItemType:   itemType,
		ItemID:     pgtype.UUID{Bytes: itemID, Valid: true},
		Token:      token,
		CreatedBy:  session.UserID,
		Permission: database.NullPermissionRole{PermissionRole: permission, Valid: true},
		ExpiresAt:  expiresAt,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("failed to create share link: %v", err))
		return
	}

	respondWithJSON(w, http.StatusOK, shareLink)
}

// GetShareLinks returns all active share links for an item
func (h *SharingHandler) GetShareLinks(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	itemType := r.URL.Query().Get("item_type")
	itemID := r.URL.Query().Get("item_id")

	if itemType == "" || itemID == "" {
		respondWithError(w, http.StatusBadRequest, "item_type and item_id are required")
		return
	}

	// Validate item type
	var dbItemType database.ItemType
	switch itemType {
	case "file":
		dbItemType = database.ItemTypeFile
	case "folder":
		dbItemType = database.ItemTypeFolder
	default:
		respondWithError(w, http.StatusBadRequest, "invalid item_type")
		return
	}

	itemUUID, err := uuid.Parse(itemID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid item_id")
		return
	}

	// Get share links
	links, err := h.queries.GetSharesByItem(r.Context(), database.GetSharesByItemParams{
		ItemType: dbItemType,
		ItemID:   pgtype.UUID{Bytes: itemUUID, Valid: true},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get share links")
		return
	}

	respondWithJSON(w, http.StatusOK, links)
}

// DeactivateShareLink disables a share link
func (h *SharingHandler) DeactivateShareLink(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	linkIDStr := chi.URLParam(r, "id")
	linkID, err := uuid.Parse(linkIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid link ID")
		return
	}

	// Deactivate the link
	if err := h.queries.DeactivateShare(r.Context(), pgtype.UUID{Bytes: linkID, Valid: true}); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to deactivate link")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "share link deactivated successfully",
	})
}

// GetSharedWithMe returns all items shared with the current user
func (h *SharingHandler) GetSharedWithMe(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Get shared files
	files, err := h.queries.GetSharedWithMeFiles(r.Context(), session.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get shared files")
		return
	}

	// Get shared folders
	folders, err := h.queries.GetSharedWithMeFolders(r.Context(), session.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get shared folders")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"files":   files,
		"folders": folders,
	})
}
