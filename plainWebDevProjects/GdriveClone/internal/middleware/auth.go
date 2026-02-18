package middleware

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/shri771/gdrive/internal/database"
)

type contextKey string

const UserContextKey = contextKey("user")

// AuthMiddleware checks for a valid session token
func AuthMiddleware(queries *database.Queries) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get token from cookie or Authorization header
			token := ""

			// Try cookie first
			cookie, err := r.Cookie("session_token")
			if err == nil {
				token = cookie.Value
			}

			// Try Authorization header if no cookie
			if token == "" {
				token = r.Header.Get("Authorization")
				if len(token) > 7 && token[:7] == "Bearer " {
					token = token[7:]
				}
			}

			if token == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "unauthorized: no session token provided",
				})
				return
			}

			// Validate session token
			session, err := queries.GetSessionByToken(r.Context(), token)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "unauthorized: invalid or expired session",
				})
				return
			}

			// Add user info to context
			ctx := context.WithValue(r.Context(), UserContextKey, &session)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext retrieves user info from the request context
func GetUserFromContext(ctx context.Context) (*database.GetSessionByTokenRow, bool) {
	user, ok := ctx.Value(UserContextKey).(*database.GetSessionByTokenRow)
	return user, ok
}
