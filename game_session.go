package main

import (
	"encoding/json"
	"log"
	"time"
)

type GameSession struct {
	ID      string
	Players []*Client
	Input   chan ClientInput
	Game    Game
	Active  bool
	Paused  bool
}

type ClientInput struct {
	ClientID string
	Message  Message
}

func (gs *GameSession) Start() {
	ticker := time.NewTicker(16 * time.Millisecond) // Approximately 30 updates per second
	defer ticker.Stop()

	for {
		select {
		case input := <-gs.Input:
			gs.processInput(input)
		case <-ticker.C:
			gs.updateGameState()
			gs.sendGameState()
		}
	}
}

func (gs *GameSession) processInput(input ClientInput) {
	if input.Message.Type == "ping" {
		// Send ping response
		var data map[string]float64
		if err := json.Unmarshal([]byte(input.Message.Body), &data); err != nil {
			return
		}

		response := Message{
			Type:     "pong",
			Body:     input.Message.Body,
			ClientID: input.ClientID,
		}

		for _, player := range gs.Players {
			if player.ID == input.ClientID {
				player.Conn.WriteJSON(response)
				break
			}
		}
		return
	}

	if input.Message.Type == "connectionStatus" {
		var data map[string]string
		if err := json.Unmarshal([]byte(input.Message.Body), &data); err != nil {
			log.Println("Error unmarshalling connection status:", err)
			return
		}

		status := data["status"]
		if status == "high-ping" {
			// Pause the game for all clients
			gs.Paused = true
			gs.broadcastGameStatus("paused")
		} else if status == "connected" {
			// Check if all players have good connection before resuming
			allConnected := true
			for _, player := range gs.Players {
				if player.ID != input.ClientID && player.LastStatus == "high-ping" {
					allConnected = false
					break
				}
			}

			// Update the player's status
			for _, player := range gs.Players {
				if player.ID == input.ClientID {
					player.LastStatus = status
					break
				}
			}

			if allConnected {
				gs.Paused = false
				gs.broadcastGameStatus("resumed")
			}
		}
		return
	}

	// Only process game inputs if not paused
	if !gs.Paused {
		var data map[string]float64
		if err := json.Unmarshal([]byte(input.Message.Body), &data); err != nil {
			log.Println("Error unmarshalling input data:", err)
			return
		}
		if input.Message.Type == "movePaddle" {
			if input.ClientID == gs.Players[0].ID {
				gs.Game.Paddle1Y = data["position"]
			} else if input.ClientID == gs.Players[1].ID {
				gs.Game.Paddle2Y = data["position"]
			}
		}
	}
}

func (gs *GameSession) broadcastGameStatus(status string) {
	statusMsg := Message{
		Type: "gameStatus",
		Body: string(mustJSON(map[string]string{"status": status})),
	}

	for _, player := range gs.Players {
		player.Conn.WriteJSON(statusMsg)
	}
}

func (gs *GameSession) updateGameState() {
	if gs.Paused {
		return // Don't update game state while paused
	}

	// Update ball position
	gs.Game.BallX += gs.Game.BallVX
	gs.Game.BallY += gs.Game.BallVY

	// Check for collisions with top and bottom walls
	if gs.Game.BallY <= 0 || gs.Game.BallY >= 1 {
		gs.Game.BallVY *= -1
	}

	// Check for collisions with paddles (simplified)
	if gs.Game.BallX <= 0.03 && gs.Game.BallY >= gs.Game.Paddle1Y-0.05 && gs.Game.BallY <= gs.Game.Paddle1Y+0.2 {
		gs.Game.BallVX *= -1
	} else if gs.Game.BallX >= 0.97 && gs.Game.BallY >= gs.Game.Paddle2Y-0.05 && gs.Game.BallY <= gs.Game.Paddle2Y+0.2 {
		gs.Game.BallVX *= -1
	}

	// Check for scoring
	if gs.Game.BallX <= 0 {
		gs.Game.Score2++
		gs.resetBall()
	} else if gs.Game.BallX >= 1 {
		gs.Game.Score1++
		gs.resetBall()
	}
}

func (gs *GameSession) resetBall() {
	gs.Game.BallX = 0.5
	gs.Game.BallY = 0.5
	gs.Game.BallVX *= -1 // Reverse direction
}

func (gs *GameSession) sendGameState() {
	if !gs.Active {
		return
	}

	gameStateMessage := Message{
		Type:     "gameState",
		Body:     gs.gameStateJSON(),
		ClientID: "",
	}

	for _, player := range gs.Players {
		gameStateMessage.ClientID = player.ID
		if err := player.Conn.WriteJSON(gameStateMessage); err != nil {
			log.Println("Error sending game state:", err)
		}
	}
}

func (gs *GameSession) gameStateJSON() string {
	gameStateBytes, err := json.Marshal(gs.Game)
	if err != nil {
		log.Println("Error marshalling game state:", err)
		return ""
	}
	return string(gameStateBytes)
}

func (gs *GameSession) PlayerDisconnected(c *Client) {

	gs.Active = false
	// Notify remaining players
	for _, player := range gs.Players {
		if player != nil && player.ID != c.ID {
			disconnectMessage := Message{
				Type:     "playerDisconnected",
				Body:     "",
				ClientID: player.ID,
			}
			player.Conn.WriteJSON(disconnectMessage)
			// Clear their game session reference
			player.GameSession = nil
		}
	}

	// Remove the session from the manager
	delete(sessionManager.Sessions, gs.ID)
	log.Printf("Game session %s ended due to player disconnect", gs.ID)
}
