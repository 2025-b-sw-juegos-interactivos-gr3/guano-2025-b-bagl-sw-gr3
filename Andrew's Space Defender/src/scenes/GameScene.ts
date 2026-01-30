import {
    Scene,
    Vector3,
    UniversalCamera,
    HemisphericLight,
    Color3,
    MeshBuilder,
    StandardMaterial,
    Mesh
} from '@babylonjs/core';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { InputSystem } from '../systems/InputSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { ScoreManager } from '../managers/ScoreManager';

export class GameScene {
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private camera: UniversalCamera;

    private player: Player;
    private enemies: Enemy[] = [];
    private projectiles: Projectile[] = [];

    private inputSystem: InputSystem;
    private collisionSystem: CollisionSystem;
    private spawnSystem: SpawnSystem;
    private scoreManager: ScoreManager;

    private gameOver: boolean = false;
    private bounds = {
        minX: -8,
        maxX: 8,
        minY: -10,
        maxY: 8
    };

    constructor(scene: Scene, canvas: HTMLCanvasElement) {
        this.scene = scene;
        this.canvas = canvas;

        this.setupCamera();
        this.setupLighting();
        this.setupBackground();

        // Initialize systems
        this.inputSystem = new InputSystem(canvas);
        this.collisionSystem = new CollisionSystem();
        this.scoreManager = new ScoreManager();

        // Create player
        this.player = new Player(this.scene, this.bounds);

        // Create spawn system
        this.spawnSystem = new SpawnSystem(this.scene, this.bounds);

        // Start game loop
        this.scene.onBeforeRenderObservable.add(() => {
            if (!this.gameOver) {
                this.update();
            }
        });

        // Initial enemy spawn
        this.spawnInitialEnemies();
    }

    private setupCamera(): void {
        // Fixed orthographic camera for 2D top-down view
        this.camera = new UniversalCamera('camera', new Vector3(0, 0, -20), this.scene);
        this.camera.mode = UniversalCamera.ORTHOGRAPHIC_CAMERA;

        // Set orthographic size
        const aspect = this.canvas.width / this.canvas.height;
        this.camera.orthoTop = 10;
        this.camera.orthoBottom = -10;
        this.camera.orthoLeft = -10 * aspect;
        this.camera.orthoRight = 10 * aspect;

        this.camera.setTarget(Vector3.Zero());
    }

    private setupLighting(): void {
        const light = new HemisphericLight('light', new Vector3(0, 0, -1), this.scene);
        light.intensity = 1.5;
        light.diffuse = new Color3(1, 1, 1);
        light.specular = new Color3(0, 0, 0);
    }

    private setupBackground(): void {
        // Create starfield effect with more visible stars
        for (let i = 0; i < 150; i++) {
            const size = Math.random() * 0.15 + 0.05;
            const star = MeshBuilder.CreateSphere(`star${i}`, { diameter: size }, this.scene);
            star.position = new Vector3(
                Math.random() * 30 - 15,
                Math.random() * 25 - 12,
                Math.random() * 3 + 2
            );

            const material = new StandardMaterial(`starMat${i}`, this.scene);
            const brightness = Math.random() * 0.5 + 0.5;
            material.emissiveColor = new Color3(brightness, brightness, brightness);
            star.material = material;
        }
    }

    private spawnInitialEnemies(): void {
        // Spawn enemies in formation like Galaga
        const rows = 3;
        const cols = 8;
        const spacing = 2;
        const startX = -(cols - 1) * spacing / 2;
        const startY = 6;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * spacing;
                const y = startY - row * 1.5;

                const enemy = new Enemy(this.scene, new Vector3(x, y, 0), row);
                this.enemies.push(enemy);
            }
        }
    }

    private update(): void {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

        // Update player
        this.player.update(this.inputSystem, deltaTime);

        // Check for player shooting
        if (this.inputSystem.isShootPressed() && this.player.canShoot()) {
            const projectile = this.player.shoot();
            if (projectile) {
                this.projectiles.push(projectile);
            }
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);

            // Check if enemy should shoot
            if (Math.random() < 0.001) {
                const enemyProjectile = enemy.shoot();
                if (enemyProjectile) {
                    this.projectiles.push(enemyProjectile);
                }
            }

            // Remove if out of bounds
            if (enemy.position.y < this.bounds.minY - 2) {
                enemy.dispose();
                this.enemies.splice(i, 1);
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);

            // Remove if out of bounds
            if (projectile.position.y > this.bounds.maxY + 2 ||
                projectile.position.y < this.bounds.minY - 2) {
                projectile.dispose();
                this.projectiles.splice(i, 1);
            }
        }

        // Check collisions
        this.checkCollisions();

        // Spawn new enemies if needed
        if (this.enemies.length < 5 && Math.random() < 0.01) {
            const newEnemy = this.spawnSystem.spawnEnemy();
            if (newEnemy) {
                this.enemies.push(newEnemy);
            }
        }

        // Check game over
        if (this.player.lives <= 0) {
            this.endGame();
        }
    }

    private checkCollisions(): void {
        // Player projectiles vs enemies
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            if (!projectile.isFromPlayer) continue;

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];

                if (this.collisionSystem.checkCollision(projectile, enemy)) {
                    // Hit!
                    projectile.dispose();
                    this.projectiles.splice(i, 1);

                    enemy.dispose();
                    this.enemies.splice(j, 1);

                    this.scoreManager.addScore(100);
                    break;
                }
            }
        }

        // Enemy projectiles vs player
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            if (projectile.isFromPlayer) continue;

            if (this.collisionSystem.checkCollision(projectile, this.player)) {
                projectile.dispose();
                this.projectiles.splice(i, 1);

                this.player.takeDamage();
            }
        }

        // Enemies vs player (collision)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (this.collisionSystem.checkCollision(enemy, this.player)) {
                enemy.dispose();
                this.enemies.splice(i, 1);

                this.player.takeDamage();
            }
        }
    }

    private endGame(): void {
        this.gameOver = true;

        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'block';
        }
    }

    public restart(): void {
        // Hide game over screen
        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'none';
        }

        // Clean up
        this.player.dispose();
        this.enemies.forEach(e => e.dispose());
        this.projectiles.forEach(p => p.dispose());

        this.enemies = [];
        this.projectiles = [];

        // Reset
        this.player = new Player(this.scene, this.bounds);
        this.scoreManager.reset();
        this.spawnInitialEnemies();

        this.gameOver = false;
    }
}
