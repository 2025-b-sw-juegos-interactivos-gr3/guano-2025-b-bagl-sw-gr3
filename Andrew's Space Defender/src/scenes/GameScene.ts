import {
    Scene,
    Vector3,
    UniversalCamera,
    HemisphericLight,
    Color3,
    Color4,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Mesh
} from '@babylonjs/core';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile } from '../entities/Projectile';
import { InputSystem } from '../systems/InputSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { ScoreManager } from '../managers/ScoreManager';
import { AudioManager } from '../managers/AudioManager';
import { ExplosionSystem } from '../systems/ParticleSystem';

export class GameScene {
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private camera!: UniversalCamera;

    private player!: Player;
    private enemies: Enemy[] = [];
    private boss: Boss | null = null;
    private projectiles: Projectile[] = [];
    private enemiesKilled: number = 0;
    private bossSpawned: boolean = false;

    private inputSystem: InputSystem;
    private collisionSystem: CollisionSystem;
    private spawnSystem: SpawnSystem;
    private scoreManager: ScoreManager;
    private audioManager: AudioManager;
    private explosionSystem: ExplosionSystem;

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

        // Set scene background color (deep space blue/black)
        this.scene.clearColor = new Color4(0.02, 0.02, 0.08, 1);

        this.setupCamera();
        this.setupLighting();
        this.setupBackground();

        // Initialize systems
        this.inputSystem = new InputSystem(canvas);
        this.collisionSystem = new CollisionSystem();
        this.scoreManager = new ScoreManager();
        this.audioManager = new AudioManager(scene);
        this.explosionSystem = new ExplosionSystem(scene);

        // Create player
        this.player = new Player(this.scene, this.bounds);

        // Create spawn system
        this.spawnSystem = new SpawnSystem(this.scene, this.bounds);

        // Start background music
        this.audioManager.playBackgroundMusic();

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
        for (let i = 0; i < 200; i++) {
            const size = Math.random() * 0.15 + 0.03;
            const star = MeshBuilder.CreateSphere(`star${i}`, { diameter: size }, this.scene);
            star.position = new Vector3(
                Math.random() * 40 - 20,
                Math.random() * 30 - 15,
                Math.random() * 5 + 3
            );

            const material = new StandardMaterial(`starMat${i}`, this.scene);
            const brightness = Math.random() * 0.7 + 0.3;
            // Random star colors (white, blue, yellow)
            const colors = [
                new Color3(brightness, brightness, brightness),
                new Color3(brightness * 0.8, brightness * 0.9, brightness),
                new Color3(brightness, brightness, brightness * 0.7)
            ];
            material.emissiveColor = colors[Math.floor(Math.random() * colors.length)];
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
                this.audioManager.playShoot();
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

        // Update boss if exists
        if (this.boss) {
            this.boss.update(deltaTime);
            
            // Boss shooting
            const bossProjectiles = this.boss.shoot();
            bossProjectiles.forEach(p => this.projectiles.push(p));
            
            // Update boss health bar
            this.updateBossHealthBar();
        }

        // Spawn boss when score reaches 2000
        if (!this.bossSpawned && this.scoreManager.getScore() >= 2000) {
            this.spawnBoss();
        }

        // Spawn new enemies only if no boss
        if (!this.boss && this.enemies.length < 5 && Math.random() < 0.02) {
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

    private spawnBoss(): void {
        this.bossSpawned = true;
        this.boss = new Boss(this.scene, new Vector3(0, 6, 0));
        
        // Clear remaining enemies when boss appears
        this.enemies.forEach(e => e.dispose());
        this.enemies = [];
        
        // Show boss health bar
        this.showBossHealthBar();
    }

    private showBossHealthBar(): void {
        const container = document.getElementById('boss-health-container');
        if (container) {
            container.style.display = 'block';
        }
        this.updateBossHealthBar();
    }

    private hideBossHealthBar(): void {
        const container = document.getElementById('boss-health-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    private updateBossHealthBar(): void {
        if (!this.boss) return;
        
        const healthPercent = Math.max(0, (this.boss.health / this.boss.maxHealth) * 100);
        
        const healthBar = document.getElementById('boss-health-bar');
        const healthText = document.getElementById('boss-health-text');
        
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
        }
        if (healthText) {
            healthText.textContent = `BOSS: ${Math.round(healthPercent)}%`;
        }
    }

    private checkCollisions(): void {
        // Player projectiles vs enemies
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            if (!projectile.isFromPlayer) continue;

            // Check vs boss first
            if (this.boss && this.collisionSystem.checkCollision(projectile, this.boss)) {
                this.explosionSystem.createSparks(projectile.position.clone());
                this.audioManager.playExplosion();

                projectile.dispose();
                this.projectiles.splice(i, 1);

                const bossDead = this.boss.takeDamage();
                this.updateBossHealthBar();
                
                if (bossDead) {
                    // Boss defeated! Big explosion
                    this.explosionSystem.createLargeExplosion(this.boss.position.clone());
                    this.hideBossHealthBar();
                    this.boss.dispose();
                    this.boss = null;
                    this.scoreManager.addScore(1000);
                    
                    // Spawn new wave of enemies
                    this.bossSpawned = false;
                    this.enemiesKilled = 0;
                    this.spawnInitialEnemies();
                }
                continue;
            }

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];

                if (this.collisionSystem.checkCollision(projectile, enemy)) {
                    // Hit! Create explosion effect and play sound
                    this.explosionSystem.createExplosion(enemy.position.clone());
                    this.audioManager.playExplosion();

                    projectile.dispose();
                    this.projectiles.splice(i, 1);

                    enemy.dispose();
                    this.enemies.splice(j, 1);

                    this.scoreManager.addScore(100);
                    this.enemiesKilled++;
                    break;
                }
            }
        }

        // Enemy projectiles vs player
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            if (projectile.isFromPlayer) continue;

            if (this.collisionSystem.checkCollision(projectile, this.player)) {
                // Player hit - sparks effect
                this.explosionSystem.createSparks(this.player.position.clone());
                this.audioManager.playExplosion();

                projectile.dispose();
                this.projectiles.splice(i, 1);

                this.player.takeDamage();
            }
        }

        // Enemies vs player (collision)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (this.collisionSystem.checkCollision(enemy, this.player)) {
                // Collision explosion
                this.explosionSystem.createExplosion(enemy.position.clone());
                this.audioManager.playExplosion();

                enemy.dispose();
                this.enemies.splice(i, 1);
                this.enemiesKilled++;

                this.player.takeDamage();
            }
        }
    }

    private endGame(): void {
        this.gameOver = true;
        this.audioManager.stopBackgroundMusic();

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

        // Hide boss health bar
        this.hideBossHealthBar();

        // Clean up
        this.player.dispose();
        this.enemies.forEach(e => e.dispose());
        this.projectiles.forEach(p => p.dispose());
        if (this.boss) {
            this.boss.dispose();
            this.boss = null;
        }

        this.enemies = [];
        this.projectiles = [];
        this.enemiesKilled = 0;
        this.bossSpawned = false;

        // Reset
        this.player = new Player(this.scene, this.bounds);
        this.scoreManager.reset();
        this.spawnInitialEnemies();

        // Restart music
        this.audioManager.playBackgroundMusic();

        this.gameOver = false;
    }
}
