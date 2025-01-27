package main

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID          string
	Conn        *websocket.Conn
	GameSession *GameSession
	LastStatus  string
}

func (c *Client) Read() {
	defer func() {
		c.Conn.Close()
		// Notify the game session that the client has disconnected
		if c.GameSession != nil {
			c.GameSession.PlayerDisconnected(c)
		}
	}()

	for {
		_, p, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			return
		}
		var message Message
		if err := json.Unmarshal(p, &message); err != nil {
			log.Println("Error unmarshalling message:", err)
			continue
		}

		// Handle findMatch message type
		if message.Type == "findMatch" {
			// Remove from current game session if exists
			if c.GameSession != nil {
				c.GameSession.PlayerDisconnected(c)
				c.GameSession = nil
			}
			// Add back to waiting queue
			waitingClients <- c
			continue
		}

		// Send other messages to game session
		if c.GameSession != nil {
			c.GameSession.Input <- ClientInput{
				ClientID: c.ID,
				Message:  message,
			}
		} else {
			log.Println("Client has no game session")
		}
	}
}
