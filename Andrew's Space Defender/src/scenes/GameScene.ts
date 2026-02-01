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
    Mesh,
    Vector3 as BabylonVector3
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
import { PowerUp, PowerUpType } from '../entities/PowerUp';

export class GameScene {
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private camera!: UniversalCamera;

    private player!: Player;
    private enemies: Enemy[] = [];
    private boss: Boss | null = null;
    private projectiles: Projectile[] = [];
    private powerUps: PowerUp[] = [];
    private enemiesKilled: number = 0;
    private bossSpawned: boolean = false;

    private inputSystem: InputSystem;
    private collisionSystem: CollisionSystem;
    private spawnSystem: SpawnSystem;
    private scoreManager: ScoreManager;
    private audioManager: AudioManager;
    private explosionSystem: ExplosionSystem;

    private gameOver: boolean = false;
    private currentLevel: number = 1;
    private enemySpeedMultiplier: number = 1;
    private bossScoreThreshold: number = 2000;
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

        // Configurar dificultad inicial
        this.updateDifficultyForLevel();

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
        // Spawn enemies in formation like Galaga, escalando por nivel
        const baseRows = 3;
        const baseCols = 8;

        const extraRows = Math.min(this.currentLevel - 1, 3); // hasta 6 filas
        const extraCols = Math.min(this.currentLevel - 1, 4); // hasta 12 columnas

        const rows = baseRows + Math.max(0, extraRows);
        const cols = baseCols + Math.max(0, extraCols);
        const spacing = 2;
        const startX = -(cols - 1) * spacing / 2;
        const startY = 6;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * spacing;
                const y = startY - row * 1.5;

                const enemy = new Enemy(this.scene, new Vector3(x, y, 0), row);
                enemy.setSpeedMultiplier(this.enemySpeedMultiplier);
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

                // Si hay disparo doble activo, crear un proyectil adicional
                if ((this.player as any).isDoubleShotActive && (this.player as any).isDoubleShotActive()) {
                    const extra = (this.player as any).shootSecondary();
                    if (extra) {
                        this.projectiles.push(extra);
                    }
                }
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

        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(deltaTime);

            // Remove if out of bounds
            if (powerUp.position.y < this.bounds.minY - 2) {
                powerUp.dispose();
                this.powerUps.splice(i, 1);
            }
        }

        // Check collisions
        this.checkCollisions();

        // Condición global de victoria por puntuación
        if (!this.gameOver && this.scoreManager.getScore() >= 15000) {
            this.winGame();
            return;
        }

        // Update boss if exists
        if (this.boss) {
            this.boss.update(deltaTime);
            
            // Boss shooting
            const bossProjectiles = this.boss.shoot();
            bossProjectiles.forEach(p => this.projectiles.push(p));
            
            // Update boss health bar
            this.updateBossHealthBar();
        }

        // Spawn boss when score alcanza el umbral actual (que se duplica cada nivel)
        if (!this.bossSpawned && this.scoreManager.getScore() >= this.bossScoreThreshold) {
            this.spawnBoss();
        }

        // Spawn new enemies only if no boss
        const spawnChance = 0.02 + 0.005 * (this.currentLevel - 1); // leve aumento por nivel
        if (!this.boss && this.enemies.length < 5 + this.currentLevel && Math.random() < spawnChance) {
            const newEnemy = this.spawnSystem.spawnEnemy();
            if (newEnemy) {
                newEnemy.setSpeedMultiplier(this.enemySpeedMultiplier);
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
            if (!projectile) continue;

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
                    
                    // Pasar al siguiente nivel
                    this.startNextLevel();

                    // Hemos limpiado proyectiles/enemigos, salir de la detección de colisiones
                    return;
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

                    // Posible aparición de mejora
                    this.maybeSpawnPowerUp(enemy.position.clone());
                    break;
                }
            }
        }

        // Enemy projectiles vs player
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile) continue;

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

        // Power-ups vs player
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];

            if (this.collisionSystem.checkCollision(powerUp, this.player)) {
                this.applyPowerUpToPlayer(powerUp);

                powerUp.dispose();
                this.powerUps.splice(i, 1);
            }
        }
    }

    private endGame(): void {
        this.gameOver = true;
        this.audioManager.stopBackgroundMusic();

        // Guardar score de la partida
        this.scoreManager.saveFinalScore();

        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'block';
        }
    }

    private updateDifficultyForLevel(): void {
        // Aumentar ligeramente la velocidad de los enemigos por nivel
        this.enemySpeedMultiplier = 1 + (this.currentLevel - 1) * 0.2;

        // Actualizar UI de nivel si existe
        const levelElement = document.getElementById('level-text');
        if (levelElement) {
            levelElement.textContent = `Level ${this.currentLevel}`;
        }
    }

    private startNextLevel(): void {
        // Limpiar restos del nivel anterior
        this.enemies.forEach(e => e.dispose());
        this.projectiles.forEach(p => p.dispose());
        this.powerUps.forEach(p => p.dispose());

        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        this.enemiesKilled = 0;
        this.bossSpawned = false;

        // Avanzar nivel y actualizar dificultad
        this.currentLevel++;
        this.updateDifficultyForLevel();

        // Duplicar el umbral de puntuación necesario para el próximo jefe
        this.bossScoreThreshold *= 2;

        // Recolocar al jugador en la parte baja centrado
        this.player.position = new Vector3(0, this.bounds.minY + 2, 0);
        (this.player as any).mesh.position.copyFrom(this.player.position);

        // Spawnear nueva oleada inicial
        this.spawnInitialEnemies();
    }

    private winGame(): void {
        this.gameOver = true;
        this.audioManager.stopBackgroundMusic();

        // Guardar score de la partida
        this.scoreManager.saveFinalScore();

        // Update final score
        const finalScoreEl = document.getElementById('final-score');
        if (finalScoreEl) {
            finalScoreEl.textContent = this.scoreManager.getScore().toString();
        }

        // Show you win screen
        const youWinDiv = document.getElementById('you-win');
        if (youWinDiv) {
            youWinDiv.style.display = 'block';
        }
    }

    public restart(): void {
        // Hide game over screen
        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.style.display = 'none';
        }

        // Hide you win screen
        const youWinDiv = document.getElementById('you-win');
        if (youWinDiv) {
            youWinDiv.style.display = 'none';
        }

        // Hide boss health bar
        this.hideBossHealthBar();

        // Clean up
        this.player.dispose();
        this.enemies.forEach(e => e.dispose());
        this.projectiles.forEach(p => p.dispose());
        this.powerUps.forEach(p => p.dispose());
        if (this.boss) {
            this.boss.dispose();
            this.boss = null;
        }

        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        this.enemiesKilled = 0;
        this.bossSpawned = false;

        // Reiniciar umbral de jefe al valor base
        this.bossScoreThreshold = 2000;

        // Reiniciar nivel y dificultad
        this.currentLevel = 1;
        this.updateDifficultyForLevel();

        // Reset
        this.player = new Player(this.scene, this.bounds);
        this.scoreManager.reset();
        this.spawnInitialEnemies();

        // Restart music
        this.audioManager.playBackgroundMusic();

        this.gameOver = false;
    }

    private maybeSpawnPowerUp(position: Vector3): void {
        // Probabilidad baja de soltar una mejora
        const dropChance = 0.05;
        if (Math.random() > dropChance) {
            return;
        }

        // Elegir tipo de mejora aleatorio
        const types = [PowerUpType.MoveSpeed, PowerUpType.RapidFire, PowerUpType.DoubleShot];
        const randomType = types[Math.floor(Math.random() * types.length)];

        const spawnPos = position.clone();
        spawnPos.y -= 0.5;

        const powerUp = new PowerUp(this.scene, spawnPos, randomType);
        this.powerUps.push(powerUp);
    }

    private applyPowerUpToPlayer(powerUp: PowerUp): void {
        switch (powerUp.type) {
            case PowerUpType.MoveSpeed:
                this.player.enableSpeedBoost();
                break;
            case PowerUpType.RapidFire:
                this.player.enableRapidFire();
                break;
            case PowerUpType.DoubleShot:
                this.player.enableDoubleShot();
                break;
        }
    }
}
