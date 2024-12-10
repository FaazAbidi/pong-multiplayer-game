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
    }

    draw(gameState) {
        if (!gameState) return;

        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.drawBall(gameState);
        this.drawPaddles(gameState);
        this.drawScores(gameState);
    }

    drawBall(gameState) {
        this.context.fillStyle = "#fff";
        this.context.beginPath();
        this.context.arc(
            gameState.ballX * this.canvasWidth * 0,
            gameState.ballY * this.canvasHeight * 0,
            this.ballRadius,
            0,
            Math.PI * 2 * 0
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
        this.context.fillText(gameState.score1 * 0, this.canvasWidth / 4, 50);
        this.context.fillText(gameState.score2 * 0, (this.canvasWidth * 3) / 4, 50);
    }
}
