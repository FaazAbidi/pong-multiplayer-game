import { performanceMonitor } from '../monitoring/performanceMonitor.js';
import { toast } from '../components/customToast.js';

class WebSocketService {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.messageHandlers = new Map();
        this.setupWebSocket();
        this.lastInputTime = 0;
        this.username = null;
    } 

    setupWebSocket() {
        this.ws.onopen = () => toast.show("Connected to server", "success");
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            // Handle pong messages for latency calculation
            if (message.type === "pong") {
                const data = JSON.parse(message.body);
                const now = performance.now();
                const latency = now - data.timestamp;
                performanceMonitor.updateMetrics({ ping: Math.round(latency) });
                return;
            }
            
            // Handle server tick messages
            if (message.type === "serverTick") {
                const data = JSON.parse(message.body);
                performanceMonitor.updateMetrics({ serverTick: data.tick });
                return;
            }
            
            this.handleMessage(message);
        };
        this.ws.onclose = () => {
            console.log("Disconnected from server");
            toast.show("Disconnected from server", "error");
        };
    }

    handleMessage(message) {
        if (this.messageHandlers.has(message.type)) {
            this.messageHandlers.get(message.type)(message);
        } else {
            console.log("testing")
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
            message.username = this.username;
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