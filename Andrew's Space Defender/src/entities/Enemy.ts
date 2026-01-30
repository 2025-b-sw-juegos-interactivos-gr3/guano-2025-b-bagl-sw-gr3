import {
    Scene,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Mesh
} from '@babylonjs/core';
import { Projectile } from './Projectile';

export class Enemy {
    private scene: Scene;
    public mesh: Mesh;
    public position: Vector3;
    private type: number; // 0 = basic, 1 = medium, 2 = strong

    private speed: number = 2;
    private direction: number = 1;
    private movementPattern: number = 0;
    private patternTime: number = 0;
    private shootCooldown: number = 0;

    constructor(scene: Scene, startPos: Vector3, row: number = 0) {
        this.scene = scene;
        this.position = startPos.clone();
        this.type = row % 3;
        this.movementPattern = Math.floor(Math.random() * 3);

        this.createMesh();
    }

    private createMesh(): void {
        // Create enemy based on type
        let color: Color3;
        let size: number;

        switch (this.type) {
            case 0: // Basic enemy (red)
                color = new Color3(1, 0, 0);
                size = 0.4;
                break;
            case 1: // Medium enemy (orange)
                color = new Color3(1, 0.5, 0);
                size = 0.5;
                break;
            case 2: // Strong enemy (purple)
                color = new Color3(0.5, 0, 1);
                size = 0.6;
                break;
            default:
                color = new Color3(1, 0, 0);
                size = 0.4;
        }

        // Create enemy body (sphere for simplicity)
        this.mesh = MeshBuilder.CreateSphere('enemy', {
            diameter: size * 2,
            segments: 8
        }, this.scene);

        const material = new StandardMaterial('enemyMat', this.scene);
        material.emissiveColor = color;
        material.diffuseColor = color;
        this.mesh.material = material;

        // Add small antenna/indicator on top
        const antenna = MeshBuilder.CreateBox('antenna', {
            width: 0.1,
            height: size * 0.5,
            depth: 0.1
        }, this.scene);
        antenna.position = new Vector3(0, size, 0);
        antenna.parent = this.mesh;

        const antennaMat = new StandardMaterial('antennaMat', this.scene);
        antennaMat.emissiveColor = new Color3(1, 1, 0);
        antennaMat.diffuseColor = new Color3(1, 1, 0);
        antenna.material = antennaMat;

        this.mesh.position = this.position;
    }

    public update(deltaTime: number): void {
        this.patternTime += deltaTime;
        this.shootCooldown -= deltaTime;

        // Movement patterns
        switch (this.movementPattern) {
            case 0: // Horizontal zigzag
                this.position.x += this.direction * this.speed * deltaTime;
                if (Math.abs(this.position.x) > 8) {
                    this.direction *= -1;
                    this.position.y -= 0.5;
                }
                break;

            case 1: // Sine wave
                this.position.y -= this.speed * 0.3 * deltaTime;
                this.position.x = Math.sin(this.patternTime * 2) * 3;
                break;

            case 2: // Diagonal swoop
                this.position.y -= this.speed * 0.5 * deltaTime;
                this.position.x += Math.cos(this.patternTime) * this.speed * deltaTime;
                break;
        }

        // Update mesh position
        this.mesh.position.copyFrom(this.position);
    }

    public shoot(): Projectile | null {
        if (this.shootCooldown > 0) {
            return null;
        }

        // Random shoot chance
        if (Math.random() > 0.02) {
            return null;
        }

        this.shootCooldown = 2 + Math.random() * 2;

        const projectilePos = this.position.clone();
        projectilePos.y -= 0.5;

        return new Projectile(this.scene, projectilePos, false);
    }

    public dispose(): void {
        this.mesh.dispose();
    }
}
