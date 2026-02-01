import {
    Scene,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Mesh
} from '@babylonjs/core';
import { Projectile } from './Projectile';

export class Enemy {
    private scene: Scene;
    public mesh!: Mesh;
    public position: Vector3;
    private type: number; // 0 = basic (LV1), 1 = medium (LV2), 2 = strong (LV3)

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
        // Determine which texture to use based on enemy type
        let texturePath: string;
        let size: number;

        switch (this.type) {
            case 0: // Basic enemy - Level 1
                texturePath = '/models/enemiesLV1.png';
                size = 3.0;
                break;
            case 1: // Medium enemy - Level 2
                texturePath = '/models/enemiesLV2.png';
                size = 3.2;
                break;
            case 2: // Strong enemy - Level 3
                texturePath = '/models/enemiesLV3.png';
                size = 3.4;
                break;
            default:
                texturePath = '/models/enemiesLV1.png';
                size = 3.0;
        }

        // Create a plane to display the enemy sprite
        this.mesh = MeshBuilder.CreatePlane('enemy', {
            width: size,
            height: size
        }, this.scene);

        // Create material with the PNG texture
        const material = new StandardMaterial('enemyMat', this.scene);
        material.diffuseTexture = new Texture(texturePath, this.scene);
        material.diffuseTexture.hasAlpha = true;
        material.useAlphaFromDiffuseTexture = true;
        material.emissiveTexture = new Texture(texturePath, this.scene);
        material.backFaceCulling = false;
        
        this.mesh.material = material;
        this.mesh.position = this.position;
        
        // Rotate to face the camera (since it's a 2D plane)
        this.mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
    }

    public setSpeedMultiplier(multiplier: number): void {
        this.speed *= multiplier;
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
