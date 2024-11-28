const ws = new WebSocket("ws://localhost:8080/ws");

let gameState = null;
let playerNumber = null; // Will be assigned either 1 or 2

ws.onopen = function () {
  console.log("Connected to server");
};

ws.onmessage = function (event) {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case "gameStart":
      console.log("Game is starting");
      alert("Game is starting");
      break;
    case "gameState":
      gameState = JSON.parse(message.body);
      drawGame();
      break;
    case "playerDisconnected":
      console.log("Player disconnected");
      alert(
        "The other player has disconnected. Would you like to find a new buddy?"
      );
      break;
    default:
      console.log("Unknown message type:", message.type);
  }
};

ws.onclose = function () {
  console.log("Disconnected from server");
  alert("Disconnected from server");
};

window.addEventListener("beforeunload", function () {
  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
});

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Game variables
const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

// Event listener for paddle movement
let paddleY = canvasHeight / 2 - paddleHeight / 2;

document.addEventListener("mousemove", function (event) {
  // Get mouse position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;

  // Update paddle position
  paddleY = mouseY - paddleHeight / 2;

  // Ensure paddle stays within canvas bounds
  paddleY = Math.max(0, Math.min(canvasHeight - paddleHeight, paddleY));

  // Send normalized paddle position to server
  const message = {
    type: "movePaddle",
    body: JSON.stringify({ position: paddleY / canvasHeight }),
  };
  ws.send(JSON.stringify(message));
});

// Draw game function
function drawGame() {
  if (!gameState) return;

  // Clear canvas
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw ball
  context.fillStyle = "#fff";
  context.beginPath();
  context.arc(
    gameState.ballX * canvasWidth,
    gameState.ballY * canvasHeight,
    ballRadius,
    0,
    Math.PI * 2
  );
  context.fill();

  // Draw paddles
  // Player 1 paddle (left)
  context.fillRect(
    10,
    gameState.paddle1Y * canvasHeight,
    paddleWidth,
    paddleHeight
  );

  // Player 2 paddle (right)
  context.fillRect(
    canvasWidth - paddleWidth - 10,
    gameState.paddle2Y * canvasHeight,
    paddleWidth,
    paddleHeight
  );

  // Draw scores
  context.font = "30px Arial";
  context.fillText(gameState.score1, canvasWidth / 4, 50);
  context.fillText(gameState.score2, (canvasWidth * 3) / 4, 50);
}

// Animation loop (optional, if you want to animate locally)
function animate() {
  requestAnimationFrame(animate);
  drawGame();
}

// Start animation loop
animate();
