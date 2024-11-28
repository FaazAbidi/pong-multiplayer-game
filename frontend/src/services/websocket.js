class WebSocketService {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.messageHandlers = new Map();
        this.setupWebSocket();
    } 

    setupWebSocket() {
        this.ws.onopen = () => toast.show("Connected to server", "success");
        this.ws.onmessage = (event) => this.handleMessage(event);
        this.ws.onclose = () => {
            console.log("Disconnected from server");
            toast.show("Disconnected from server", "error");
        };
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