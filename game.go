package main

type Game struct {
	BallX    float64 `json:"ballX"`
	BallY    float64 `json:"ballY"`
	BallVX   float64 `json:"ballVX"`
	BallVY   float64 `json:"ballVY"`
	Paddle1Y float64 `json:"paddle1Y"`
	Paddle2Y float64 `json:"paddle2Y"`
	Score1   int     `json:"score1"`
	Score2   int     `json:"score2"`
}

func initialGameState() Game {
	return Game{
		BallX:    0.5,
		BallY:    0.5,
		BallVX:   0.005,
		BallVY:   0.005,
		Paddle1Y: 0.5,
		Paddle2Y: 0.5,
		Score1:   0,
		Score2:   0,
	}
}
