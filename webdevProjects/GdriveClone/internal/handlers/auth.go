package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shri771/gdrive/internal/database"
	"github.com/shri771/gdrive/internal/services"
)

type AuthHandler struct {
	queries     *database.Queries
	authService *services.AuthService
}

func NewAuthHandler(queries *database.Queries, authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		queries:     queries,
		authService: authService,
	}
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string            `json:"token"`
	User  *database.User    `json:"user"`
}

// Register creates a new user account
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" || req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "email, password, and name are required")
		return
	}

	// Hash password
	hashedPassword, err := h.authService.HashPassword(req.Password)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to hash password")
		return
	}

	// Create user
	user, err := h.queries.CreateUser(r.Context(), database.CreateUserParams{
		Email:          req.Email,
		HashedPassword: hashedPassword,
		Name:           req.Name,
	})
	if err != nil {
		respondWithError(w, http.StatusConflict, "failed to create user: email may already exist")
		return
	}

	// Create root folder for user
	_, err = h.queries.CreateFolder(r.Context(), database.CreateFolderParams{
		Name:     "My Drive",
		OwnerID:  user.ID,
		IsRoot:   pgtype.Bool{Bool: true, Valid: true},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to create root folder")
		return
	}

	// Generate session token
	token, err := h.authService.GenerateSessionToken()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to generate session token")
		return
	}

	// Create session
	expiresAt := h.authService.GetSessionExpiry()
	session, err := h.queries.CreateSession(r.Context(), database.CreateSessionParams{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: pgtype.Timestamp{Time: expiresAt, Valid: true},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    session.Token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // Lax for localhost development
		Secure:   false, // Set to true in production with HTTPS
		MaxAge:   int(expiresAt.Unix() - session.CreatedAt.Time.Unix()),
	})

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		Token: session.Token,
		User:  &user,
	})
}

// Login authenticates a user
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		respondWithError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	// Get user by email
	user, err := h.queries.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	// Check password
	if err := h.authService.CheckPassword(user.HashedPassword, req.Password); err != nil {
		respondWithError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	// Generate session token
	token, err := h.authService.GenerateSessionToken()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to generate session token")
		return
	}

	// Create session
	expiresAt := h.authService.GetSessionExpiry()
	session, err := h.queries.CreateSession(r.Context(), database.CreateSessionParams{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: pgtype.Timestamp{Time: expiresAt, Valid: true},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    session.Token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // Lax for localhost development
		Secure:   false, // Set to true in production with HTTPS
		MaxAge:   int(expiresAt.Unix() - session.CreatedAt.Time.Unix()),
	})

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		Token: session.Token,
		User:  &user,
	})
}

// Logout deletes the current session
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Get token from cookie
	cookie, err := r.Cookie("session_token")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "no session found")
		return
	}

	// Delete session from database
	if err := h.queries.DeleteSession(r.Context(), cookie.Value); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to delete session")
		return
	}

	// Clear cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "logged out successfully",
	})
}

// Me returns the current authenticated user
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	// Get token from cookie or header
	token := ""
	cookie, err := r.Cookie("session_token")
	if err == nil {
		token = cookie.Value
	}

	if token == "" {
		token = r.Header.Get("Authorization")
		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}
	}

	if token == "" {
		respondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Get session
	session, err := h.queries.GetSessionByToken(r.Context(), token)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "invalid or expired session")
		return
	}

	// Get full user details
	user, err := h.queries.GetUserByID(r.Context(), session.UserID)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "user not found")
		return
	}

	// Get storage usage
	storage, err := h.queries.GetStorageUsage(r.Context(), user.ID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get storage usage")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": user,
		"storage": map[string]int64{
			"used":  storage.StorageUsed.Int64,
			"limit": storage.StorageLimit.Int64,
		},
	})
}

// SearchUsers searches for users by email (for sharing)
func (h *AuthHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		respondWithError(w, http.StatusBadRequest, "search query required")
		return
	}

	users, err := h.queries.SearchUsersByEmail(r.Context(), pgtype.Text{String: query, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to search users")
		return
	}

	// Return limited user info (no sensitive data)
	type UserSearchResult struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	results := make([]UserSearchResult, 0, len(users))
	for _, user := range users {
		userID, _ := user.ID.Value()
		results = append(results, UserSearchResult{
			ID:    userID.(string),
			Email: user.Email,
			Name:  user.Name,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
