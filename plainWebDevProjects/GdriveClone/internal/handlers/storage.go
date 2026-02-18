package handlers

import (
	"fmt"
	"net/http"

	"github.com/shri771/gdrive/internal/database"
	"github.com/shri771/gdrive/internal/middleware"
)

type StorageHandler struct {
	queries *database.Queries
}

func NewStorageHandler(queries *database.Queries) *StorageHandler {
	return &StorageHandler{queries: queries}
}

type StorageStatsResponse struct {
	StorageUsed   int64                    `json:"storage_used"`
	StorageLimit  int64                    `json:"storage_limit"`
	TotalFiles    int64                    `json:"total_files"`
	TotalFolders  int64                    `json:"total_folders"`
	ByFileType    []FileTypeStorageBreakdown `json:"by_file_type"`
}

type FileTypeStorageBreakdown struct {
	FileType   string `json:"file_type"`
	FileCount  int64  `json:"file_count"`
	TotalSize  int64  `json:"total_size"`
	Percentage float64 `json:"percentage"`
}

// GetStorageAnalytics returns comprehensive storage analytics for the current user
func (h *StorageHandler) GetStorageAnalytics(w http.ResponseWriter, r *http.Request) {
	session, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Get overall storage stats
	stats, err := h.queries.GetUserStorageStats(r.Context(), session.UserID)
	if err != nil {
		fmt.Printf("Error getting storage stats: %v\n", err)
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("failed to get storage stats: %v", err))
		return
	}

	// Get storage breakdown by file type
	typeBreakdown, err := h.queries.GetStorageByFileType(r.Context(), session.UserID)
	if err != nil {
		fmt.Printf("Error getting file type breakdown: %v\n", err)
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("failed to get file type breakdown: %v", err))
		return
	}

	// Calculate percentages
	var breakdown []FileTypeStorageBreakdown
	totalUsed := stats.StorageUsed.Int64
	if totalUsed == 0 {
		totalUsed = 1 // Prevent division by zero
	}

	for _, item := range typeBreakdown {
		totalSize, ok := item.TotalSize.(int64)
		if !ok {
			totalSize = 0
		}
		percentage := (float64(totalSize) / float64(totalUsed)) * 100
		breakdown = append(breakdown, FileTypeStorageBreakdown{
			FileType:   item.FileType,
			FileCount:  item.FileCount,
			TotalSize:  totalSize,
			Percentage: percentage,
		})
	}

	response := StorageStatsResponse{
		StorageUsed:   stats.StorageUsed.Int64,
		StorageLimit:  stats.StorageLimit.Int64,
		TotalFiles:    stats.TotalFiles,
		TotalFolders:  stats.TotalFolders,
		ByFileType:    breakdown,
	}

	if response.ByFileType == nil {
		response.ByFileType = []FileTypeStorageBreakdown{}
	}

	respondWithJSON(w, http.StatusOK, response)
}
