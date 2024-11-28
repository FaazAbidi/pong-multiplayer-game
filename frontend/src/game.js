import { wsService } from './services/websocket.js';
import { gameState } from './state/gameState.js';
import { GameRenderer } from './renderer/gameRenderer.js';
import { PaddleController } from './input/paddleController.js';

class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.renderer = new GameRenderer(this.canvas);
        this.paddleController = new PaddleController(this.canvas, wsService);
        
        this.setupMessageHandlers();
        this.setupWindowEvents();
        this.startGameLoop();
    }

setupMessageHandlers() {
        wsService.addMessageHandler("connected", (msg) => {
            gameState.setState({ clientID: msg.clientID });
        });

        wsService.addMessageHandler("gameState", (msg) => {
            gameState.setState({ gameState: JSON.parse(msg.body) });
        });

        wsService.addMessageHandler("playerDisconnected", () => {
            console.log("Player disconnected");
            if (confirm("The other player has disconnected. Find new match?")) {
                this.findNewMatch();
            }
        });

        wsService.addMessageHandler("gameStart", () => {
            console.log("Game started");
        });

        wsService.addMessageHandler("waitingForMatch", () => {
            console.log("Waiting for match");
        });
    }

    setupWindowEvents() {
        window.addEventListener("beforeunload", () => wsService.close());
    }

    startGameLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            const state = gameState.getState();
            this.renderer.draw(state.gameState);
        };
        animate();
    }

    findNewMatch() {
        wsService.send({
            type: "findMatch",
            body: ""
        });
    }
}

// Start the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => new Game());