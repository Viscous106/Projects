package services

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/shri771/gdrive/internal/database"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from React dev server
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:5173" || origin == ""
	},
}

// Client represents a WebSocket connection
type Client struct {
	ID       uuid.UUID
	FileID   uuid.UUID
	UserID   pgtype.UUID
	Conn     *websocket.Conn
	Send     chan []byte
	Hub      *Hub
}

// Hub maintains the set of active clients and broadcasts messages to clients
type Hub struct {
	// Registered clients per file
	clients map[uuid.UUID]map[*Client]bool

	// Inbound messages from clients
	broadcast chan *Message

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Mutex for thread-safe operations
	mu sync.RWMutex

	// Database queries for validation
	queries *database.Queries
}

// Message represents a WebSocket message
type Message struct {
	Type      string      `json:"type"`
	FileID    uuid.UUID   `json:"file_id,omitempty"`
	CommentID uuid.UUID   `json:"comment_id,omitempty"`
	Comment   interface{} `json:"comment,omitempty"`
	UserID    uuid.UUID   `json:"user_id,omitempty"`
}

// NewHub creates a new Hub instance
func NewHub(queries *database.Queries) *Hub {
	return &Hub{
		clients:    make(map[uuid.UUID]map[*Client]bool),
		broadcast:  make(chan *Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		queries:    queries,
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.FileID] == nil {
				h.clients[client.FileID] = make(map[*Client]bool)
			}
			h.clients[client.FileID][client] = true
			h.mu.Unlock()
			log.Printf("Client registered: %s for file: %s", client.ID, client.FileID)

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.clients[client.FileID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.clients, client.FileID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("Client unregistered: %s for file: %s", client.ID, client.FileID)

		case message := <-h.broadcast:
			h.mu.RLock()
			if clients, ok := h.clients[message.FileID]; ok {
				data, err := json.Marshal(message)
				if err != nil {
					log.Printf("Error marshaling message: %v", err)
					h.mu.RUnlock()
					continue
				}

				for client := range clients {
					select {
					case client.Send <- data:
					default:
						close(client.Send)
						delete(clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastComment broadcasts a comment event to all clients for a file
func (h *Hub) BroadcastComment(fileID uuid.UUID, messageType string, comment interface{}, commentID uuid.UUID) {
	msg := &Message{
		Type:      messageType,
		FileID:    fileID,
		Comment:   comment,
		CommentID: commentID,
	}
	h.broadcast <- msg
}

// readPump pumps messages from the WebSocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Handle incoming messages (e.g., typing indicators, etc.)
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err == nil {
			log.Printf("Received message from client %s: %v", c.ID, msg)
		}
	}
}

// writePump pumps messages from the hub to the WebSocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current message
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ServeWS handles WebSocket requests from clients
func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request, fileID uuid.UUID) {
	// Get token from query parameter
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "token required", http.StatusUnauthorized)
		return
	}

	// Validate session token
	session, err := h.queries.GetSessionByToken(r.Context(), token)
	if err != nil {
		http.Error(w, "invalid or expired session", http.StatusUnauthorized)
		return
	}

	// Verify file exists and user has access
	file, err := h.queries.GetFileByID(r.Context(), pgtype.UUID{Bytes: fileID, Valid: true})
	if err != nil {
		http.Error(w, "file not found", http.StatusNotFound)
		return
	}

	// Check if user has access
	hasAccess := file.OwnerID.Bytes == session.UserID.Bytes
	if !hasAccess {
		// Check if file has been shared with user
		perms, err := h.queries.GetItemPermissions(r.Context(), database.GetItemPermissionsParams{
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
		http.Error(w, "access denied", http.StatusForbidden)
		return
	}

	// Upgrade connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	// Create client
	client := &Client{
		ID:     uuid.New(),
		FileID: fileID,
		UserID: session.UserID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		Hub:    h,
	}

	// Register client
	h.register <- client

	// Start goroutines for reading and writing
	go client.writePump()
	go client.readPump()
}

