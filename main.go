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

	client := &Client{
		ID:   generateClientID(),
		Conn: conn,
	}

	// Add the client to the matchmaking queue
	waitingClients <- client

	// Start reading messages from the client
	go client.Read()
}

func setupRoutes() {
	http.HandleFunc("/ws", serveWs)
}

func main() {
	fmt.Println("Server started on :8080")

	// Start the matchmaking goroutine
	go handleMatchmaking()

	setupRoutes()
	log.Fatal(http.ListenAndServe(":8080", nil))
}
