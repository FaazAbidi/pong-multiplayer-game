package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
)

func generateClientID() string {
	return generateRandomID()
}

func generateSessionID() string {
	return generateRandomID()
}

func generateRandomID() string {
	b := make([]byte, 8)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}

func mustJSON(v interface{}) []byte {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("Error marshalling JSON: %v", err)
		return []byte("{}")
	}
	return data
}
