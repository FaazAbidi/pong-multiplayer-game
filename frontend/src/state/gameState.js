class GameState {
    constructor() {
        this.state = {
            gameState: null,
            clientID: null,
            playerNumber: null,
            isPaused: false,
            isReconnecting: false,
            connectionStatus: 'connected',
            player1Username: null,
            player2Username: null,
        };
        this.listeners = new Set();
    }

    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    getState() {
        return { ...this.state };
    }

    addListener(listener) {
        this.listeners.add(listener);
    }

    removeListener(listener) {
        this.listeners.delete(listener);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    pauseGame() {
        this.setState({ isPaused: true });
    }

    resumeGame() {
        this.setState({ isPaused: false });
    }

    setReconnecting(status) {
        this.setState({ isReconnecting: status });
    }

    setConnectionStatus(status) {
        this.setState({ connectionStatus: status });
        if (status === 'high-ping') {
            this.pauseGame();
        } else if (status === 'connected' && !this.state.isReconnecting) {
            this.resumeGame();
        }
    }

    isGameActive() {
        return !this.state.isPaused && !this.state.isReconnecting;
    }
}

export const gameState = new GameState();