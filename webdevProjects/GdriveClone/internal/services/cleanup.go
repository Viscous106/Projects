package services

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/shri771/gdrive/internal/database"
)

type CleanupService struct {
	queries *database.Queries
	db      database.DBTX
}

func NewCleanupService(queries *database.Queries, db database.DBTX) *CleanupService {
	return &CleanupService{
		queries: queries,
		db:      db,
	}
}

// CleanupTrash permanently deletes files and folders in trash older than the specified days
func (s *CleanupService) CleanupTrash(ctx context.Context, daysInTrash int32) (filesDeleted int, foldersDeleted int, err error) {
	// Get files in trash older than specified days
	files, err := s.queries.GetFilesInTrashOlderThan(ctx, daysInTrash)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get files in trash: %w", err)
	}

	// Get folders in trash older than specified days
	folders, err := s.queries.GetFoldersInTrashOlderThan(ctx, daysInTrash)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get folders in trash: %w", err)
	}

	filesDeleted = 0
	foldersDeleted = 0

	// Delete files permanently and remove from storage
	for _, file := range files {
		// Delete physical file from storage
		if file.StoragePath != "" {
			if err := os.Remove(file.StoragePath); err != nil {
				// Log error but continue
				fmt.Printf("Warning: failed to delete file from storage: %s, error: %v\n", file.StoragePath, err)
			}
		}

		// Delete thumbnail if exists
		if file.ThumbnailPath.Valid && file.ThumbnailPath.String != "" {
			if err := os.Remove(file.ThumbnailPath.String); err != nil {
				fmt.Printf("Warning: failed to delete thumbnail: %s, error: %v\n", file.ThumbnailPath.String, err)
			}
		}

		// Mark file as permanently deleted in database
		if err := s.queries.PermanentDeleteFile(ctx, file.ID); err != nil {
			fmt.Printf("Warning: failed to permanently delete file %s: %v\n", file.ID.Bytes, err)
			continue
		}

		filesDeleted++
	}

	// Delete folders permanently
	for _, folder := range folders {
		// Mark folder as permanently deleted in database
		if err := s.queries.PermanentDeleteFolder(ctx, folder.ID); err != nil {
			fmt.Printf("Warning: failed to permanently delete folder %s: %v\n", folder.ID.Bytes, err)
			continue
		}

		foldersDeleted++
	}

	return filesDeleted, foldersDeleted, nil
}

// StartCleanupScheduler starts a background goroutine that runs cleanup daily
func (s *CleanupService) StartCleanupScheduler(ctx context.Context, daysInTrash int32, interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		// Run cleanup immediately on start
		files, folders, err := s.CleanupTrash(ctx, daysInTrash)
		if err != nil {
			fmt.Printf("Error during initial cleanup: %v\n", err)
		} else {
			fmt.Printf("Initial cleanup completed: %d files, %d folders deleted\n", files, folders)
		}

		for {
			select {
			case <-ctx.Done():
				fmt.Println("Cleanup scheduler stopped")
				return
			case <-ticker.C:
				files, folders, err := s.CleanupTrash(ctx, daysInTrash)
				if err != nil {
					fmt.Printf("Error during scheduled cleanup: %v\n", err)
				} else {
					fmt.Printf("Scheduled cleanup completed: %d files, %d folders deleted\n", files, folders)
				}
			}
		}
	}()
}

