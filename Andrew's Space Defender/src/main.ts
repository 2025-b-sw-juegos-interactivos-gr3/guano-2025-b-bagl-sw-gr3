import { Engine, Scene, Color4 } from '@babylonjs/core';
import { GameScene } from './scenes/GameScene';
import { ScoreManager } from './managers/ScoreManager';

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

        const uiOverlay = document.getElementById('ui-overlay');
        const mainMenu = document.getElementById('main-menu');
        const scoresPanel = document.getElementById('scores-panel');
        const scoresList = document.getElementById('scores-list');

        // Botón de iniciar juego desde el menú
        const menuStart = document.getElementById('menu-start');
        if (menuStart && uiOverlay && mainMenu) {
            menuStart.addEventListener('click', () => {
                mainMenu.style.display = 'none';
                uiOverlay.style.display = 'block';
                this.gameScene.restart();
            });
        }

        // Mostrar scores
        const menuScores = document.getElementById('menu-scores');
        if (menuScores && mainMenu && scoresPanel && scoresList) {
            menuScores.addEventListener('click', () => {
                mainMenu.style.display = 'none';
                scoresPanel.style.display = 'flex';

                scoresList.innerHTML = '';
                const scores = ScoreManager.getScores();
                if (!scores.length) {
                    const li = document.createElement('li');
                    li.textContent = 'No hay partidas registradas aún.';
                    scoresList.appendChild(li);
                } else {
                    // Mostrar del último al primero
                    scores.slice().reverse().forEach((entry, index) => {
                        const li = document.createElement('li');
                        const date = new Date(entry.date);
                        li.textContent = `${index + 1}. ${entry.score} puntos - ${date.toLocaleString()}`;
                        scoresList.appendChild(li);
                    });
                }
            });
        }

        // Volver al menú desde el panel de scores
        const scoresBack = document.getElementById('scores-back');
        if (scoresBack && mainMenu && scoresPanel) {
            scoresBack.addEventListener('click', () => {
                scoresPanel.style.display = 'none';
                mainMenu.style.display = 'flex';
            });
        }

        // Handle restart button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.gameScene.restart();
            });
        }

        // Volver al menú desde Game Over
        const menuButton = document.getElementById('menu-button');
        if (menuButton && mainMenu && uiOverlay) {
            menuButton.addEventListener('click', () => {
                const gameOverDiv = document.getElementById('game-over');
                if (gameOverDiv) {
                    gameOverDiv.style.display = 'none';
                }
                uiOverlay.style.display = 'none';
                mainMenu.style.display = 'flex';
            });
        }

        // Handle play again button (after winning)
        const restartButtonWin = document.getElementById('restart-button-win');
        if (restartButtonWin) {
            restartButtonWin.addEventListener('click', () => {
                this.gameScene.restart();
            });
        }
    }
}

// Start the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
