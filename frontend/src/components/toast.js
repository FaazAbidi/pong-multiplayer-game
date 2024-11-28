export class Toast {
    constructor() {
        this.createToastContainer();
    }

    createToastContainer() {
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            background-color: ${this.getBackgroundColor(type)};
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            margin-bottom: 10px;
            opacity: 0;
            transition: opacity 0.3s ease-in;
            font-family: Arial, sans-serif;
        `;
        toast.textContent = message;
        
        this.container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.style.opacity = '1', 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => this.container.removeChild(toast), 300);
        }, 3000);
    }

    getBackgroundColor(type) {
        switch (type) {
            case 'error': return '#dc3545';
            case 'success': return '#28a745';
            case 'warning': return '#ffc107';
            default: return '#17a2b8';
        }
    }
}

export const toast = new Toast();