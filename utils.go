package main

import (
	"crypto/rand"
	"encoding/hex"
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
