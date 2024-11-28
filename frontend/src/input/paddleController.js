export class PaddleController {
    constructor(canvas, wsService) {
        this.canvas = canvas;
        this.wsService = wsService;
        this.setupMouseControl();
    }

    setupMouseControl() {
        let lastSentTime = 0;
        const minTimeBetweenUpdates = 16; // ~60fps

        this.canvas.addEventListener("mousemove", (event) => {
            const currentTime = Date.now();
            if (currentTime - lastSentTime < minTimeBetweenUpdates) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = event.clientY - rect.top;
            const paddleY = Math.max(0, Math.min(
                this.canvas.height - 100,
                mouseY - 50
            ));

            this.wsService.send({
                type: "movePaddle",
                body: JSON.stringify({ position: paddleY / this.canvas.height })
            });

            lastSentTime = currentTime;
        });
    }
}