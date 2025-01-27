# pong-multiplayer-game

# Run this project using the following commands:

```
go run .
```

## Performance Metrics

The game includes several performance metrics to monitor game health:

1. **FPS (Frames Per Second)**
   - Measures how many frames are rendered per second on the client
   - Calculated using `requestAnimationFrame` and `performance.now()`
   - Ideal value: 60 FPS (matches browser refresh rate)
   - Reference: `frontend/src/monitoring/performanceMonitor.js` (lines 37-47)

2. **Ping (Latency)**
   - Measures round-trip time between client and server
   - Calculated using ping/pong messages with timestamps
   - Ideal value: < 100ms
   - Reference: `frontend/src/game.js` (lines 59-67) and `game_session.go` (lines 39-60)

3. **Server Tick**
   - Measures time between server game state updates
   - Calculated using `time.Now()` on server
   - Ideal value: ~16ms (60 updates per second)
   - Reference: `game_session.go` (lines 114-117)

4. **Input Latency**
   - Measures time between user input and message sending
   - Calculated using `performance.now()` for mouse movements
   - Ideal value: < 50ms
   - Reference: `frontend/src/services/websocket.js` (lines 55-59)

These metrics are displayed in the top-left corner of the game window and can help identify performance bottlenecks.
