package main

import (
	"log"
)

var waitingClients = make(chan *Client, 100)
var sessionManager = NewSessionManager()

type SessionManager struct {
	Sessions map[string]*GameSession
}

func NewSessionManager() *SessionManager {
	return &SessionManager{
		Sessions: make(map[string]*GameSession),
	}
}

func handleMatchmaking() {
	for {
		// Get two clients from the waiting queue
		client1 := <-waitingClients
		log.Printf("Client %s is waiting for a match", client1.ID)
		client1.Conn.WriteJSON(Message{
			Type:     "waitingForMatch",
			Body:     "",
			ClientID: client1.ID,
		})

		client2 := <-waitingClients
		log.Printf("Client %s is matched with client %s", client2.ID, client1.ID)

		// Create a new game session
		sessionID := generateSessionID()
		gameSession := &GameSession{
			ID:      sessionID,
			Players: []*Client{client1, client2},
			Input:   make(chan ClientInput, 100),
			Game:    initialGameState(),
			Active:  true,
		}

		// Assign the game session to the clients
		client1.GameSession = gameSession
		client2.GameSession = gameSession

		// Add session to the session manager
		sessionManager.Sessions[sessionID] = gameSession

		// Send start messages with client IDs
		for _, player := range gameSession.Players {
			startMessage := Message{
				Type:     "gameStart",
				Body:     "",
				ClientID: player.ID,
			}
			player.Conn.WriteJSON(startMessage)
		}

		// Start the game session
		go gameSession.Start()
	}
}
