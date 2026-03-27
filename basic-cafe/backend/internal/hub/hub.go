package hub

import (
	"encoding/json"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/rs/zerolog/log"
)

// Event is a WebSocket event sent to all connected clients.
type Event struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

// Hub manages WebSocket client connections and broadcasts events.
type Hub struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]struct{}
}

// New creates a new Hub.
func New() *Hub {
	return &Hub{
		clients: make(map[*websocket.Conn]struct{}),
	}
}

// Register adds a WebSocket connection to the hub.
func (h *Hub) Register(conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[conn] = struct{}{}
}

// Unregister removes a WebSocket connection from the hub.
func (h *Hub) Unregister(conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, conn)
}

// Broadcast sends an event to all connected clients.
func (h *Hub) Broadcast(event Event) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Error().Err(err).Msg("ws hub: failed to marshal event")
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()
	for conn := range h.clients {
		if err := conn.WriteMessage(1, data); err != nil {
			log.Warn().Err(err).Msg("ws hub: failed to write to client")
		}
	}
}
