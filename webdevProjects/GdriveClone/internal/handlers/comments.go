package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/shri771/gdrive/internal/database"
	"github.com/shri771/gdrive/internal/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// Hub interface for WebSocket broadcasting
type CommentHub interface {
	BroadcastComment(fileID uuid.UUID, messageType string, comment interface{}, commentID uuid.UUID)
}

type CommentHandler struct {
	queries *database.Queries
	hub     CommentHub
}

func NewCommentHandler(queries *database.Queries, hub CommentHub) *CommentHandler {
	return &CommentHandler{
		queries: queries,
		hub:     hub,
	}
}

type CreateCommentRequest struct {
	FileID  string `json:"file_id"`
	Content string `json:"content"`
}

type UpdateCommentRequest struct {
	Content string `json:"content"`
}

type CommentResponse struct {
	ID        uuid.UUID `json:"id"`
	FileID    uuid.UUID `json:"file_id"`
	UserID    uuid.UUID `json:"user_id"`
	UserName  string    `json:"user_name"`
	Email     string    `json:"email"`
	Content   string    `json:"content"`
	CreatedAt string    `json:"created_at"`
	UpdatedAt string    `json:"updated_at"`
}

// CreateComment creates a new comment on a file
func (h *CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	session, ok := middleware.GetUserFromContext(ctx)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Content == "" {
		respondWithError(w, http.StatusBadRequest, "comment content is required")
		return
	}

	fileID, err := uuid.Parse(req.FileID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Verify file exists and user has access
	file, err := h.queries.GetFileByID(ctx, pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	// Check if user has access (owner or has been shared with)
	hasAccess := file.OwnerID.Bytes == session.UserID.Bytes
	if !hasAccess {
		// Check if file has been shared with user
		perms, err := h.queries.GetItemPermissions(ctx, database.GetItemPermissionsParams{
			ItemID:   pgtype.UUID{Bytes: fileID, Valid: true},
			ItemType: database.ItemTypeFile,
		})
		if err == nil {
			for _, perm := range perms {
				if perm.UserID.Bytes == session.UserID.Bytes {
					hasAccess = true
					break
				}
			}
		}
	}

	if !hasAccess {
		respondWithError(w, http.StatusForbidden, "access denied")
		return
	}

	comment, err := h.queries.CreateComment(ctx, database.CreateCommentParams{
		FileID:  pgtype.UUID{Bytes: fileID, Valid: true},
		UserID:  session.UserID,
		Content: req.Content,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to create comment")
		return
	}

	// Get user info for response
	user, _ := h.queries.GetUserByID(ctx, session.UserID)

	response := CommentResponse{
		ID:        uuid.UUID(comment.ID.Bytes),
		FileID:    uuid.UUID(comment.FileID.Bytes),
		UserID:    uuid.UUID(comment.UserID.Bytes),
		UserName:  user.Name,
		Email:     user.Email,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt.Time.Format("2006-01-02T15:04:05Z"),
		UpdatedAt: comment.UpdatedAt.Time.Format("2006-01-02T15:04:05Z"),
	}

	// Broadcast comment creation via WebSocket
	if h.hub != nil {
		h.hub.BroadcastComment(uuid.UUID(fileID), "comment_created", response, uuid.UUID(comment.ID.Bytes))
	}

	respondWithJSON(w, http.StatusCreated, response)
}

// GetFileComments retrieves all comments for a file
func (h *CommentHandler) GetFileComments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	session, ok := middleware.GetUserFromContext(ctx)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := r.URL.Query().Get("file_id")
	if fileIDStr == "" {
		respondWithError(w, http.StatusBadRequest, "file ID is required")
		return
	}

	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file ID")
		return
	}

	// Verify file exists and user has access
	file, err := h.queries.GetFileByID(ctx, pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "file not found")
		return
	}

	// Check if user has access
	hasAccess := file.OwnerID.Bytes == session.UserID.Bytes
	if !hasAccess {
		perms, err := h.queries.GetItemPermissions(ctx, database.GetItemPermissionsParams{
			ItemID:   pgtype.UUID{Bytes: fileID, Valid: true},
			ItemType: database.ItemTypeFile,
		})
		if err == nil {
			for _, perm := range perms {
				if perm.UserID.Bytes == session.UserID.Bytes {
					hasAccess = true
					break
				}
			}
		}
	}

	if !hasAccess {
		respondWithError(w, http.StatusForbidden, "access denied")
		return
	}

	comments, err := h.queries.GetFileComments(ctx, pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to retrieve comments")
		return
	}

	var response []CommentResponse
	for _, comment := range comments {
		response = append(response, CommentResponse{
			ID:        uuid.UUID(comment.ID.Bytes),
			FileID:    uuid.UUID(comment.FileID.Bytes),
			UserID:    uuid.UUID(comment.UserID.Bytes),
			UserName:  comment.UserName,
			Email:     comment.Email,
			Content:   comment.Content,
			CreatedAt: comment.CreatedAt.Time.Format("2006-01-02T15:04:05Z"),
			UpdatedAt: comment.UpdatedAt.Time.Format("2006-01-02T15:04:05Z"),
		})
	}

	if response == nil {
		response = []CommentResponse{}
	}

	respondWithJSON(w, http.StatusOK, response)
}

// UpdateComment updates a comment
func (h *CommentHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	session, ok := middleware.GetUserFromContext(ctx)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	commentIDStr := chi.URLParam(r, "id")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid comment ID")
		return
	}

	var req UpdateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Content == "" {
		respondWithError(w, http.StatusBadRequest, "comment content is required")
		return
	}

	// Get existing comment
	existingComment, err := h.queries.GetComment(ctx, pgtype.UUID{Bytes: commentID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "comment not found")
		return
	}

	// Only comment owner can update
	if existingComment.UserID.Bytes != session.UserID.Bytes {
		respondWithError(w, http.StatusForbidden, "access denied")
		return
	}

	comment, err := h.queries.UpdateComment(ctx, database.UpdateCommentParams{
		ID:      pgtype.UUID{Bytes: commentID, Valid: true},
		Content: req.Content,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to update comment")
		return
	}

	user, _ := h.queries.GetUserByID(ctx, session.UserID)

	response := CommentResponse{
		ID:        uuid.UUID(comment.ID.Bytes),
		FileID:    uuid.UUID(comment.FileID.Bytes),
		UserID:    uuid.UUID(comment.UserID.Bytes),
		UserName:  user.Name,
		Email:     user.Email,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt.Time.Format("2006-01-02T15:04:05Z"),
		UpdatedAt: comment.UpdatedAt.Time.Format("2006-01-02T15:04:05Z"),
	}

	// Broadcast comment update via WebSocket
	if h.hub != nil {
		h.hub.BroadcastComment(uuid.UUID(existingComment.FileID.Bytes), "comment_updated", response, uuid.UUID(comment.ID.Bytes))
	}

	respondWithJSON(w, http.StatusOK, response)
}

// DeleteComment soft deletes a comment
func (h *CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	session, ok := middleware.GetUserFromContext(ctx)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	commentIDStr := chi.URLParam(r, "id")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid comment ID")
		return
	}

	// Get existing comment
	existingComment, err := h.queries.GetComment(ctx, pgtype.UUID{Bytes: commentID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusNotFound, "comment not found")
		return
	}

	// Only comment owner can delete
	if existingComment.UserID.Bytes != session.UserID.Bytes {
		respondWithError(w, http.StatusForbidden, "access denied")
		return
	}

	err = h.queries.DeleteComment(ctx, pgtype.UUID{Bytes: commentID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to delete comment")
		return
	}

	// Broadcast comment deletion via WebSocket
	if h.hub != nil {
		h.hub.BroadcastComment(uuid.UUID(existingComment.FileID.Bytes), "comment_deleted", nil, uuid.UUID(commentID))
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "comment deleted successfully"})
}
