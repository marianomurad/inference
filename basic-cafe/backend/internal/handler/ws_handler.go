package handler

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/marianomurad/inference/basic-cafe/backend/internal/hub"
)

func WSUpgradeMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	}
}

func NewWSHandler(h *hub.Hub) fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {
		h.Register(c)
		defer h.Unregister(c)

		for {
			_, _, err := c.ReadMessage()
			if err != nil {
				break
			}
		}
	})
}
