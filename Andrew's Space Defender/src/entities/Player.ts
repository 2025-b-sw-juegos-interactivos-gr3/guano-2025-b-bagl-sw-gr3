import {
    Scene,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Mesh,
    SceneLoader,
    AbstractMesh
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InputSystem } from '../systems/InputSystem';
import { Projectile } from './Projectile';

export class Player {
    private scene: Scene;
    public mesh!: Mesh;
    private loadedMeshes: AbstractMesh[] = [];
    public position: Vector3;
    public lives: number = 3;
    private bounds: { minX: number; maxX: number; minY: number; maxY: number };

    private speed: number = 8;
    private shootCooldown: number = 0;
    private shootDelay: number = 0.25;
    private invulnerable: boolean = false;
    private invulnerableTime: number = 0;
    private modelLoaded: boolean = false;

    constructor(scene: Scene, bounds: any) {
        this.scene = scene;
        this.bounds = bounds;
        this.position = new Vector3(0, -8, 0);

        this.createMesh();
        this.loadModel();
        this.updateLivesUI();
    }

    private createMesh(): void {
        // Create a placeholder/container mesh (invisible)
        this.mesh = MeshBuilder.CreateBox('player', {
            width: 0.1,
            height: 0.1,
            depth: 0.1
        }, this.scene);
        this.mesh.isVisible = false;
        this.mesh.position = this.position;
    }

    private async loadModel(): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync(
                '',
                '/models/',
                'nave.glb',
                this.scene
            );

            this.loadedMeshes = result.meshes;
            
            // Configure loaded meshes
            result.meshes.forEach((mesh) => {
                mesh.parent = this.mesh;
                // Adjust scale - very small size for the game
                mesh.scaling = new Vector3(0.03, 0.03, 0.03);
            });

            // Rotate to face up if needed (adjust as necessary)
            this.mesh.rotation.x = 0;
            this.mesh.rotation.y = 0;
            this.mesh.rotation.z = 0;

            this.modelLoaded = true;
            console.log('Player model loaded successfully!');
        } catch (error) {
            console.error('Error loading player model:', error);
            // Fallback to basic mesh if model fails to load
            this.createFallbackMesh();
        }
    }

    private createFallbackMesh(): void {
        // Fallback: Create basic ship shape if model fails to load
        const material = new StandardMaterial('playerMat', this.scene);
        material.emissiveColor = new Color3(0, 1, 0);
        material.diffuseColor = new Color3(0, 1, 0);

        const body = MeshBuilder.CreateBox('playerBody', {
            width: 0.8,
            height: 1,
            depth: 0.2
        }, this.scene);
        body.material = material;
        body.parent = this.mesh;

        this.mesh.isVisible = false;
    }

    public update(input: InputSystem, deltaTime: number): void {
        // Handle invulnerability
        if (this.invulnerable) {
            this.invulnerableTime -= deltaTime;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
                this.setNormalColor();
            } else {
                // Blink effect
                const blink = Math.floor(this.invulnerableTime * 10) % 2;
                if (blink === 0) {
                    this.setInvulnerableColor();
                } else {
                    this.setNormalColor();
                }
            }
        }

        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }

        // Movement
        let moveX = 0;

        if (input.isLeftPressed()) {
            moveX = -1;
        }
        if (input.isRightPressed()) {
            moveX = 1;
        }

        // Update position
        this.position.x += moveX * this.speed * deltaTime;

        // Clamp to bounds
        this.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.position.x));

        // Update mesh position
        this.mesh.position.copyFrom(this.position);
    }

    public canShoot(): boolean {
        return this.shootCooldown <= 0;
    }

    public shoot(): Projectile | null {
        if (!this.canShoot()) {
            return null;
        }

        this.shootCooldown = this.shootDelay;

        const projectilePos = this.position.clone();
        projectilePos.y += 0.5;

        return new Projectile(this.scene, projectilePos, true);
    }

    public takeDamage(): void {
        if (this.invulnerable) {
            return;
        }

        this.lives--;
        this.updateLivesUI();

        if (this.lives > 0) {
            this.invulnerable = true;
            this.invulnerableTime = 2;
        }
    }

    private updateLivesUI(): void {
        const livesElement = document.getElementById('lives-count');
        if (livesElement) {
            livesElement.textContent = this.lives.toString();
        }
    }

    private setInvulnerableColor(): void {
        // Apply red tint to loaded model meshes
        this.loadedMeshes.forEach(mesh => {
            if (mesh.material && mesh.material instanceof StandardMaterial) {
                mesh.material.emissiveColor = new Color3(1, 0, 0);
            }
        });
        // Also handle child meshes
        this.mesh.getChildMeshes().forEach(child => {
            const childMat = child.material as StandardMaterial;
            if (childMat && childMat.emissiveColor) {
                childMat.emissiveColor = new Color3(1, 0, 0);
            }
        });
    }

    private setNormalColor(): void {
        // Reset color on loaded model meshes
        this.loadedMeshes.forEach(mesh => {
            if (mesh.material && mesh.material instanceof StandardMaterial) {
                mesh.material.emissiveColor = new Color3(0, 0, 0);
            }
        });
        // Also handle child meshes
        this.mesh.getChildMeshes().forEach(child => {
            const childMat = child.material as StandardMaterial;
            if (childMat && childMat.emissiveColor) {
                childMat.emissiveColor = new Color3(0, 0, 0);
            }
        });
    }

    public dispose(): void {
        this.loadedMeshes.forEach(mesh => mesh.dispose());
        this.mesh.dispose();
    }
}
