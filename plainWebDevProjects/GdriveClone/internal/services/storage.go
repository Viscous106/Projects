package services

import (
	"fmt"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
)

type StorageService struct {
	basePath      string
	thumbnailPath string
}

func NewStorageService(basePath, thumbnailPath string) *StorageService {
	return &StorageService{
		basePath:      basePath,
		thumbnailPath: thumbnailPath,
	}
}

// SaveFile saves a file to the storage system
// Returns: (storagePath, error)
func (s *StorageService) SaveFile(
	userID uuid.UUID,
	fileID uuid.UUID,
	file io.Reader,
	filename string,
	version int,
) (string, error) {
	// Create path: storage/uploads/user_{uuid}/file_{uuid}/
	userDir := filepath.Join(s.basePath, fmt.Sprintf("user_%s", userID.String()))
	fileDir := filepath.Join(userDir, fileID.String())

	// Create directories if they don't exist
	if err := os.MkdirAll(fileDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Save file with version prefix: v1_filename.ext
	filenameWithVersion := fmt.Sprintf("v%d_%s", version, filename)
	fullPath := filepath.Join(fileDir, filenameWithVersion)

	// Create the file
	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy the uploaded file content
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	// Return relative path for database
	relativePath := filepath.Join(
		fmt.Sprintf("user_%s", userID.String()),
		fileID.String(),
		fmt.Sprintf("v%d_%s", version, filename),
	)

	return relativePath, nil
}

// GetFile opens a file from storage
func (s *StorageService) GetFile(storagePath string) (*os.File, error) {
	fullPath := filepath.Join(s.basePath, storagePath)

	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("file not found: %s", storagePath)
	}

	// Open the file
	file, err := os.Open(fullPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}

	return file, nil
}

// DeleteFile removes a file from storage
func (s *StorageService) DeleteFile(storagePath string) error {
	fullPath := filepath.Join(s.basePath, storagePath)

	if err := os.Remove(fullPath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}

// GetFileSize returns the size of a file in bytes
func (s *StorageService) GetFileSize(storagePath string) (int64, error) {
	fullPath := filepath.Join(s.basePath, storagePath)

	info, err := os.Stat(fullPath)
	if err != nil {
		return 0, fmt.Errorf("failed to get file info: %w", err)
	}

	return info.Size(), nil
}

// MoveFile moves a file from one location to another
func (s *StorageService) MoveFile(oldPath, newPath string) error {
	oldFullPath := filepath.Join(s.basePath, oldPath)
	newFullPath := filepath.Join(s.basePath, newPath)

	// Create destination directory if it doesn't exist
	newDir := filepath.Dir(newFullPath)
	if err := os.MkdirAll(newDir, 0755); err != nil {
		return fmt.Errorf("failed to create destination directory: %w", err)
	}

	// Move the file
	if err := os.Rename(oldFullPath, newFullPath); err != nil {
		return fmt.Errorf("failed to move file: %w", err)
	}

	return nil
}

// GenerateThumbnail generates a thumbnail for an image file
// Returns: (thumbnailPath, error)
func (s *StorageService) GenerateThumbnail(storagePath string, mimeType string, fileID uuid.UUID) (string, error) {
	// Only generate thumbnails for images
	if !strings.HasPrefix(mimeType, "image/") {
		return "", fmt.Errorf("file is not an image")
	}

	// Full path to original file
	fullPath := filepath.Join(s.basePath, storagePath)

	// Open and decode the image
	src, err := imaging.Open(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to open image: %w", err)
	}

	// Create thumbnail (200x200 max, maintaining aspect ratio)
	thumbnail := imaging.Fit(src, 200, 200, imaging.Lanczos)

	// Create thumbnail directory structure: thumbnails/file_{uuid}.jpg
	thumbnailFilename := fmt.Sprintf("%s.jpg", fileID.String())
	thumbnailFullPath := filepath.Join(s.thumbnailPath, thumbnailFilename)

	// Ensure thumbnail directory exists
	if err := os.MkdirAll(s.thumbnailPath, 0755); err != nil {
		return "", fmt.Errorf("failed to create thumbnail directory: %w", err)
	}

	// Save thumbnail as JPEG (smaller file size)
	if err := imaging.Save(thumbnail, thumbnailFullPath); err != nil {
		return "", fmt.Errorf("failed to save thumbnail: %w", err)
	}

	// Return relative path for database
	return thumbnailFilename, nil
}
