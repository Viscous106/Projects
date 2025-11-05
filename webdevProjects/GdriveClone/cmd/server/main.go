package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/shri771/gdrive/internal/database"
	"github.com/shri771/gdrive/internal/handlers"
	"github.com/shri771/gdrive/internal/middleware"
	"github.com/shri771/gdrive/internal/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Get config from environment
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "1030"
	}

	storagePath := os.Getenv("STORAGE_PATH")
	if storagePath == "" {
		storagePath = "storage/uploads"
	}

	thumbnailPath := os.Getenv("THUMBNAIL_PATH")
	if thumbnailPath == "" {
		thumbnailPath = "storage/thumbnails"
	}

	sessionDurationHours, err := strconv.Atoi(os.Getenv("SESSION_DURATION_HOURS"))
	if err != nil {
		sessionDurationHours = 720 // 30 days default
	}

	// Create storage directories
	if err := os.MkdirAll(storagePath, 0755); err != nil {
		log.Fatalf("Failed to create storage directory: %v", err)
	}
	if err := os.MkdirAll(thumbnailPath, 0755); err != nil {
		log.Fatalf("Failed to create thumbnail directory: %v", err)
	}

	// Connect to database
	dbPool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	// Test database connection
	if err := dbPool.Ping(context.Background()); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("✅ Connected to database")

	// Initialize database queries
	queries := database.New(dbPool)

	// Initialize services
	authService := services.NewAuthService(jwtSecret, sessionDurationHours)
	storageService := services.NewStorageService(storagePath, thumbnailPath)
	cleanupService := services.NewCleanupService(queries, dbPool)

	// Get trash cleanup configuration
	trashDays, err := strconv.Atoi(os.Getenv("TRASH_CLEANUP_DAYS"))
	if err != nil {
		trashDays = 30 // Default 30 days
	}

	// Initialize WebSocket hub
	wsHub := services.NewHub(queries)
	go wsHub.Run()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(queries, authService)
	filesHandler := handlers.NewFilesHandler(queries, storageService, dbPool)
	foldersHandler := handlers.NewFoldersHandler(queries)
	sharingHandler := handlers.NewSharingHandler(queries, authService)
	versionsHandler := handlers.NewVersionsHandler(queries)
	activityHandler := handlers.NewActivityHandler(queries)
	commentHandler := handlers.NewCommentHandler(queries, wsHub)
	storageHandler := handlers.NewStorageHandler(queries)
	wsHandler := handlers.NewWebSocketHandler(wsHub)

	// Setup router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(middleware.CORS) // Enable CORS for React frontend

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// WebSocket routes (token-based auth via query param)
	r.Get("/api/ws/comments/{fileId}", wsHandler.HandleCommentsWS)

	// Public routes (no authentication required)
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Get("/me", authHandler.Me) // Can work with or without auth
	})

	// Protected routes (authentication required)
	r.Route("/api", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware(queries))

		// Auth routes
		r.Post("/auth/logout", authHandler.Logout)

		// User search
		r.Get("/users/search", authHandler.SearchUsers)

		// File routes
		r.Route("/files", func(r chi.Router) {
			r.Get("/", filesHandler.GetFiles)
			r.Post("/upload", filesHandler.UploadFile)
			r.Get("/recent", filesHandler.GetRecentFiles)
			r.Get("/starred", filesHandler.GetStarredFiles)
			r.Get("/trash", filesHandler.GetTrashedFiles)
			r.Get("/search", filesHandler.SearchFiles)

			r.Route("/{id}", func(r chi.Router) {
				r.Get("/download", filesHandler.DownloadFile)
				r.Get("/thumbnail", filesHandler.GetThumbnail)
				r.Delete("/", filesHandler.DeleteFile)
				r.Post("/restore", filesHandler.RestoreFile)
				r.Delete("/permanent", filesHandler.PermanentDeleteFile)
				r.Post("/star", filesHandler.ToggleStar)
				r.Put("/rename", filesHandler.RenameFile)
				r.Put("/move", filesHandler.MoveFile)
			})
		})

		// Folder routes
		r.Route("/folders", func(r chi.Router) {
			r.Get("/", foldersHandler.GetFolders)
			r.Post("/", foldersHandler.CreateFolder)
			r.Get("/root", foldersHandler.GetRootFolder)
			r.Get("/starred", foldersHandler.GetStarredFolders)
			r.Get("/trash", foldersHandler.GetTrashedFolders)
			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", foldersHandler.GetFolderByIDHandler)
				r.Put("/rename", foldersHandler.RenameFolder)
				r.Put("/move", foldersHandler.MoveFolder)
				r.Post("/star", foldersHandler.ToggleStarFolder)
				r.Delete("/", foldersHandler.DeleteFolder)
				r.Post("/restore", foldersHandler.RestoreFolder)
				r.Delete("/permanent", foldersHandler.PermanentDeleteFolder)
			})
		})

		// Sharing routes
		r.Route("/sharing", func(r chi.Router) {
			r.Post("/share", sharingHandler.ShareItem)
			r.Get("/permissions", sharingHandler.GetItemPermissions)
			r.Post("/revoke", sharingHandler.RevokePermission)
			r.Post("/link", sharingHandler.CreateShareLink)
			r.Get("/links", sharingHandler.GetShareLinks)
			r.Delete("/link/{id}", sharingHandler.DeactivateShareLink)
			r.Get("/shared-with-me", sharingHandler.GetSharedWithMe)
		})

		// Version history routes
		r.Route("/versions", func(r chi.Router) {
			r.Get("/file/{fileId}", versionsHandler.GetFileVersions)
			r.Get("/{versionId}", versionsHandler.GetFileVersion)
		})

		// Activity routes
		r.Route("/activity", func(r chi.Router) {
			r.Get("/", activityHandler.GetUserActivity)
			r.Get("/file", activityHandler.GetFileActivity)
			r.Get("/timeline", activityHandler.GetActivityTimeline)
			r.Get("/dashboard", activityHandler.GetDashboardActivity)
		})

		// Comment routes
		r.Route("/comments", func(r chi.Router) {
			r.Post("/", commentHandler.CreateComment)
			r.Get("/", commentHandler.GetFileComments)
			r.Put("/{id}", commentHandler.UpdateComment)
			r.Delete("/{id}", commentHandler.DeleteComment)
		})

		// Storage analytics routes
		r.Get("/storage/analytics", storageHandler.GetStorageAnalytics)
	})

	// Start cleanup scheduler (runs daily to permanently delete files in trash older than specified days)
	ctx := context.Background()
	cleanupService.StartCleanupScheduler(ctx, int32(trashDays), 24*time.Hour)
	log.Printf("🧹 Trash cleanup scheduler started (deletes files older than %d days)", trashDays)

	// Start server
	addr := fmt.Sprintf(":%s", port)
	log.Printf("🚀 Server starting on http://localhost%s", addr)
	log.Printf("📁 Storage path: %s", storagePath)
	log.Printf("🔒 CORS enabled for: http://localhost:1573")

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}