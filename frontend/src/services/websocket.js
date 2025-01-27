import { performanceMonitor } from '../monitoring/performanceMonitor.js';
import { toast } from '../components/customToast.js';
import { gameState } from '../state/gameState.js';

class WebSocketService {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.messageHandlers = new Map();
        this.lastInputTime = 0;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second delay
        this.lastPingStatus = 'connected';
        this.setupPerformanceMonitoring();
        this.connect();
    }

    setupPerformanceMonitoring() {
        performanceMonitor.addConnectionListener((status) => {
            // Only notify server if status changed
            if (this.lastPingStatus !== status) {
                this.lastPingStatus = status;
                // Notify server about connection status change
                this.send({
                    type: "connectionStatus",
                    body: JSON.stringify({ status })
                });
            }
            gameState.setConnectionStatus(status);
        });
    }

    connect() {
        this.ws = new WebSocket(this.url);
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.ws.onopen = () => {
            toast.show("Connected to server", "success");
            gameState.setReconnecting(false);
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            if (message.type === "pong") {
                const data = JSON.parse(message.body);
                const latency = performance.now() - data.timestamp;
                performanceMonitor.updateMetrics({ ping: Math.round(latency) });
            } else if (message.type === "gameStatus") {
                // Handle game status updates from server
                const data = JSON.parse(message.body);
                if (data.status === 'paused') {
                    gameState.pauseGame();
                    toast.show("Game paused: Player experiencing connection issues", "warning");
                } else if (data.status === 'resumed') {
                    gameState.resumeGame();
                    toast.show("Game resumed: Connection stable", "success");
                }
            }
            
            this.handleMessage(event);
        };

        this.ws.onclose = () => {
            console.log("Disconnected from server");
            toast.show("Disconnected from server", "error");
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            toast.show("Connection error", "error");
        };

        // Start ping monitoring
        this.startPingMonitoring();
    }

    startPingMonitoring() {
        setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.send({
                    type: "ping",
                    body: JSON.stringify({ timestamp: performance.now() })
                });
            }
        }, 1000); // Send ping every second
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            gameState.setReconnecting(true);
            toast.show(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`, "info");
            
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
                this.reconnectDelay *= 2; // Exponential backoff
            }, this.reconnectDelay);
        } else {
            toast.show("Failed to reconnect after multiple attempts", "error");
        }
    }

    handleMessage(event) {
        const message = JSON.parse(event.data);
        if (this.messageHandlers.has(message.type)) {
            this.messageHandlers.get(message.type)(message);
        } else {
            console.log("Unknown message type:", message.type);
        }
    }

    addMessageHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }

    send(message) {
        if (this.ws.readyState === WebSocket.OPEN) {
            if (message.type === "movePaddle") {
                const inputLatency = performance.now() - this.lastInputTime;
                performanceMonitor.updateMetrics({ inputLatency: Math.round(inputLatency) });
                this.lastInputTime = performance.now();
            }
            this.ws.send(JSON.stringify(message));
        }
    }

    close() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        }
    }
}

export const wsService = new WebSocketService(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);