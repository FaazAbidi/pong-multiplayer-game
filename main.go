package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow connections from any origin
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func serveWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	clientID := generateClientID()
	client := &Client{
		ID:   clientID,
		Conn: conn,
	}

	// Send initial connection confirmation with client ID
	conn.WriteJSON(Message{
		Type:     "connected",
		Body:     "",
		ClientID: clientID,
	})

	// Add the client to the matchmaking queue
	waitingClients <- client

	// Start reading messages from the client
	go client.Read()
}

func setupRoutes() {
	// Serve static files from the frontend directory
	fs := http.FileServer(http.Dir("frontend"))
	http.Handle("/", fs)
	
	// WebSocket endpoint
	http.HandleFunc("/ws", serveWs)
}

func main() {
	fmt.Println("Server started on :8080")

	// Start the matchmaking goroutine
	go handleMatchmaking()

	setupRoutes()
	log.Fatal(http.ListenAndServe(":8080", nil))
}
