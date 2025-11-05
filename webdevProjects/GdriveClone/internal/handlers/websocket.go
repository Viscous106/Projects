package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/shri771/gdrive/internal/services"
)

type WebSocketHandler struct {
	hub *services.Hub
}

func NewWebSocketHandler(hub *services.Hub) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
	}
}

// HandleCommentsWS handles WebSocket connections for real-time comments
func (h *WebSocketHandler) HandleCommentsWS(w http.ResponseWriter, r *http.Request) {
	fileIDStr := chi.URLParam(r, "fileId")
	fileID, err := uuid.Parse(fileIDStr)
	if err != nil {
		http.Error(w, "invalid file ID", http.StatusBadRequest)
		return
	}

	// Serve WebSocket connection
	h.hub.ServeWS(w, r, fileID)
}

