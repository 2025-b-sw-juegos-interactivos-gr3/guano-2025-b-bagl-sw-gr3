import {
    Scene,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Mesh
} from '@babylonjs/core';
import { InputSystem } from '../systems/InputSystem';
import { Projectile } from './Projectile';

export class Player {
    private scene: Scene;
    public mesh: Mesh;
    public position: Vector3;
    public lives: number = 3;
    private bounds: { minX: number; maxX: number; minY: number; maxY: number };

    private speed: number = 8;
    private shootCooldown: number = 0;
    private shootDelay: number = 0.25;
    private invulnerable: boolean = false;
    private invulnerableTime: number = 0;

    constructor(scene: Scene, bounds: any) {
        this.scene = scene;
        this.bounds = bounds;
        this.position = new Vector3(0, -8, 0);

        this.createMesh();
        this.updateLivesUI();
    }

    private createMesh(): void {
        // Create player ship using basic 3D shapes
        this.mesh = MeshBuilder.CreateBox('player', {
            width: 0.8,
            height: 1,
            depth: 0.2
        }, this.scene);

        const material = new StandardMaterial('playerMat', this.scene);
        material.emissiveColor = new Color3(0, 1, 0);
        material.diffuseColor = new Color3(0, 1, 0);
        this.mesh.material = material;

        // Add wings (small boxes on sides)
        const leftWing = MeshBuilder.CreateBox('leftWing', {
            width: 0.3,
            height: 0.4,
            depth: 0.1
        }, this.scene);
        leftWing.position = new Vector3(-0.5, -0.2, 0);
        leftWing.parent = this.mesh;
        leftWing.material = material;

        const rightWing = MeshBuilder.CreateBox('rightWing', {
            width: 0.3,
            height: 0.4,
            depth: 0.1
        }, this.scene);
        rightWing.position = new Vector3(0.5, -0.2, 0);
        rightWing.parent = this.mesh;
        rightWing.material = material;

        this.mesh.position = this.position;
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
        const material = this.mesh.material as StandardMaterial;
        if (material) {
            material.emissiveColor = new Color3(1, 0, 0);
            material.diffuseColor = new Color3(1, 0, 0);
        }
        // Update children
        this.mesh.getChildMeshes().forEach(child => {
            const childMat = child.material as StandardMaterial;
            if (childMat) {
                childMat.emissiveColor = new Color3(1, 0, 0);
                childMat.diffuseColor = new Color3(1, 0, 0);
            }
        });
    }

    private setNormalColor(): void {
        const material = this.mesh.material as StandardMaterial;
        if (material) {
            material.emissiveColor = new Color3(0, 1, 0);
            material.diffuseColor = new Color3(0, 1, 0);
        }
        // Update children
        this.mesh.getChildMeshes().forEach(child => {
            const childMat = child.material as StandardMaterial;
            if (childMat) {
                childMat.emissiveColor = new Color3(0, 1, 0);
                childMat.diffuseColor = new Color3(0, 1, 0);
            }
        });
    }

    public dispose(): void {
        this.mesh.dispose();
    }
}
