export class PerformanceMonitor {
    constructor() {
        this.createMonitorElement();
        this.metrics = {
            fps: 0,
            ping: 0,
            serverTick: 0,
            inputLatency: 0
        };
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
    }

    createMonitorElement() {
        this.element = document.createElement('div');
        this.element.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: #00ff00;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            border-radius: 4px;
            z-index: 1000;
        `;
        document.body.appendChild(this.element);
    }

    updateMetrics(newMetrics) {
        this.metrics = { ...this.metrics, ...newMetrics };
        this.updateDisplay();
    }

    calculateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.metrics.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.element.innerHTML = `
            FPS: ${this.metrics.fps}<br>
            Ping: ${this.metrics.ping}ms<br>
            Server Tick: ${this.metrics.serverTick}ms<br>
            Input Latency: ${this.metrics.inputLatency}ms
        `;
    }
}

export const performanceMonitor = new PerformanceMonitor();