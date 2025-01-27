export class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        
        // Constants
        this.paddleWidth = 10;
        this.paddleHeight = 100;
        this.ballRadius = 10;

        // Get username elements
        this.player1UsernameElement = document.getElementById('player1Username');
        this.player2UsernameElement = document.getElementById('player2Username');
        
        // Check if elements exist
        if (!this.player1UsernameElement || !this.player2UsernameElement) {
            console.error('Username elements not found in the DOM');
        }
    }

    draw(gameState) {
        if (!gameState) {
            this.drawWaitingMessage();
            return;
        }

        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.drawBall(gameState);
        this.drawPaddles(gameState);
        this.drawScores(gameState);
    }

    drawBall(gameState) {
        this.context.fillStyle = "#fff";
        this.context.beginPath();
        this.context.arc(
            gameState.ballX * this.canvasWidth,
            gameState.ballY * this.canvasHeight,
            this.ballRadius,
            0,
            Math.PI * 2
        );
        this.context.fill();
    }

    drawPaddles(gameState) {
        // Player 1 paddle (left)
        this.context.fillRect(
            10,
            gameState.paddle1Y * this.canvasHeight,
            this.paddleWidth,
            this.paddleHeight
        );

        // Player 2 paddle (right)
        this.context.fillRect(
            this.canvasWidth - this.paddleWidth - 10,
            gameState.paddle2Y * this.canvasHeight,
            this.paddleWidth,
            this.paddleHeight
        );
    }

    drawScores(gameState) {
        this.context.font = "30px Arial";
        this.context.fillText(gameState.score1, this.canvasWidth / 4, 50);
        this.context.fillText(gameState.score2, (this.canvasWidth * 3) / 4, 50);
    }

    updateUsernames(gameState) {
        if (!gameState) return;
        
        if (this.player1UsernameElement && gameState.player1Username) {
            this.player1UsernameElement.textContent = gameState.player1Username;
        }
        if (this.player2UsernameElement && gameState.player2Username) {
            this.player2UsernameElement.textContent = gameState.player2Username;
        }
    }

    drawWaitingMessage() {
        this.context.fillStyle = "#fff";
        this.context.font = "20px Arial";
        this.context.textAlign = "center";
        this.context.fillText(
            "Waiting for another player...",
            this.canvasWidth / 2,
            this.canvasHeight / 2
        );
    }
}
