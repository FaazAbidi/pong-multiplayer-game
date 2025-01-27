class GameState {
    constructor() {
        this.state = {
            gameState: null,
            clientID: null,
            playerNumber: null,
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
}

export const gameState = new GameState();