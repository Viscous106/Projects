package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shri771/gdrive/internal/database"
	"github.com/shri771/gdrive/internal/middleware"
)

type ActivityHandler struct {
	queries *database.Queries
}

func NewActivityHandler(queries *database.Queries) *ActivityHandler {
	return &ActivityHandler{
		queries: queries,
	}
}

// GetUserActivity returns the user's recent activity
func (h *ActivityHandler) GetUserActivity(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Get limit from query params, default to 50
	limitStr := r.URL.Query().Get("limit")
	limit := int32(50)
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 && parsedLimit <= 200 {
			limit = int32(parsedLimit)
		}
	}

	// Get user activity
	activities, err := h.queries.GetUserActivity(r.Context(), database.GetUserActivityParams{
		UserID: session.UserID,
		Limit:  limit,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get activity")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activities)
}

// GetFileActivity returns activity for a specific file
func (h *ActivityHandler) GetFileActivity(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fileIDStr := r.URL.Query().Get("file_id")
	if fileIDStr == "" {
		respondWithError(w, http.StatusBadRequest, "file_id is required")
		return
	}

	parsedUUID, err := uuid.Parse(fileIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid file_id")
		return
	}

	// Get limit from query params, default to 20
	limitStr := r.URL.Query().Get("limit")
	limit := int32(20)
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = int32(parsedLimit)
		}
	}

	// Get file activity
	activities, err := h.queries.GetFileActivity(r.Context(), database.GetFileActivityParams{
		FileID: pgtype.UUID{Bytes: parsedUUID, Valid: true},
		Limit:  limit,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get file activity")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activities)
}

// GetActivityTimeline returns activity grouped by date
func (h *ActivityHandler) GetActivityTimeline(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Get date range from query params (default to last 30 days)
	startDateStr := r.URL.Query().Get("start_date")
	endDateStr := r.URL.Query().Get("end_date")

	var startDate, endDate time.Time
	var err error

	if startDateStr == "" {
		startDate = time.Now().AddDate(0, 0, -30) // 30 days ago
	} else {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "invalid start_date format (use YYYY-MM-DD)")
			return
		}
	}

	if endDateStr == "" {
		endDate = time.Now()
	} else {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "invalid end_date format (use YYYY-MM-DD)")
			return
		}
	}

	// Get activity timeline
	activities, err := h.queries.GetActivityTimeline(r.Context(), database.GetActivityTimelineParams{
		UserID:  session.UserID,
		Column2: pgtype.Date{Time: startDate, Valid: true},
		Column3: pgtype.Date{Time: endDate, Valid: true},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get activity timeline")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activities)
}

// GetDashboardActivity returns recent activities for dashboard widget
func (h *ActivityHandler) GetDashboardActivity(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Get limit from query params, default to 10
	limitStr := r.URL.Query().Get("limit")
	limit := int32(10)
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 && parsedLimit <= 50 {
			limit = int32(parsedLimit)
		}
	}

	// Get dashboard activity
	activities, err := h.queries.GetDashboardActivity(r.Context(), database.GetDashboardActivityParams{
		UserID: session.UserID,
		Limit:  limit,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get dashboard activity")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activities)
}
