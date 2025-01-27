import { wsService } from './services/websocket.js';
import { gameState } from './state/gameState.js';
import { GameRenderer } from './renderer/gameRenderer.js';
import { PaddleController } from './input/paddleController.js';
import { toast } from './components/customToast.js';
import { performanceMonitor } from './monitoring/performanceMonitor.js'

class Game {
    constructor() {
        // Prompt for username
        this.username = null;
        while (!this.username || this.username.trim() === "") {
            this.username = prompt("Please enter your username:");
        }

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
            // Send username after connection is confirmed
            wsService.send({
                type: "setUsername",
                body: this.username
            });
        });

        wsService.addMessageHandler("gameState", (msg) => {
            gameState.setState({ gameState: JSON.parse(msg.body) });
        });

        wsService.addMessageHandler("playerDisconnected", () => {
            toast.show("The other player has disconnected", "warning");
            this.findNewMatch();
        });

        wsService.addMessageHandler("gameStart", () => {
            toast.show("Game started", "success");
        });

        wsService.addMessageHandler("waitingForMatch", () => {
            toast.show("Waiting for match. Finding an opponent...", "info");
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
            this.renderer.updateUsernames(state.gameState);
            performanceMonitor.calculateFPS();
        };
        animate();
        
        // Start ping measurement
        this.startPingMeasurement();
    }

    startPingMeasurement() {
        setInterval(() => {
            const startTime = performance.now();
            wsService.send({
                type: "ping",
                body: JSON.stringify({ timestamp: startTime })
            });
        }, 1000);
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