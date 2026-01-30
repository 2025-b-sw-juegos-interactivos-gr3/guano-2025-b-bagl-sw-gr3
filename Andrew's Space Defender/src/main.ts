import { Engine, Scene, Vector3, Color3, Color4, HemisphericLight } from '@babylonjs/core';
import { GameScene } from './scenes/GameScene';

class Game {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;
    private gameScene: GameScene;

    constructor() {
        // Get canvas element
        this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

        // Create Babylon engine
        this.engine = new Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });

        // Create the main scene
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0, 0, 0.05, 1);

        // Create game scene
        this.gameScene = new GameScene(this.scene, this.canvas);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        // Start render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // Handle restart button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.gameScene.restart();
            });
        }
    }
}

// Start the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
