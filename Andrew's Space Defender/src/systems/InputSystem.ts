export class InputSystem {
    private keys: { [key: string]: boolean } = {};
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    public isLeftPressed(): boolean {
        return this.keys['ArrowLeft'] || this.keys['KeyA'];
    }

    public isRightPressed(): boolean {
        return this.keys['ArrowRight'] || this.keys['KeyD'];
    }

    public isUpPressed(): boolean {
        return this.keys['ArrowUp'] || this.keys['KeyW'];
    }

    public isDownPressed(): boolean {
        return this.keys['ArrowDown'] || this.keys['KeyS'];
    }

    public isShootPressed(): boolean {
        return this.keys['Space'] || this.keys['Enter'];
    }
}
