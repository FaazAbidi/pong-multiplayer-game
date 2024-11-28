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

		// Send the message to the game session
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
