package main

type Message struct {
	Type     string `json:"type"`
	ClientID string `json:"clientID"`
	Body     string `json:"body"`
}
