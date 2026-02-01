import {
    Scene,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Color3,
    Mesh
} from '@babylonjs/core';
import { Projectile } from './Projectile';

export class Boss {
    private scene: Scene;
    public mesh!: Mesh;
    public position: Vector3;
    public health: number = 10;
    public maxHealth: number = 10;
    public isBoss: boolean = true;

    private speed: number = 1.5;
    private direction: number = 1;
    private patternTime: number = 0;
    private shootCooldown: number = 0;
    private phase: number = 0;

    constructor(scene: Scene, startPos: Vector3) {
        this.scene = scene;
        this.position = startPos.clone();
        this.createMesh();
    }

    private createMesh(): void {
        // Boss uses LV3 texture but much bigger
        const texturePath = '/models/enemiesLV3.png';
        const size = 8.0;

        // Create a plane for the boss sprite
        this.mesh = MeshBuilder.CreatePlane('boss', {
            width: size,
            height: size
        }, this.scene);

        // Create material with the PNG texture
        const material = new StandardMaterial('bossMat', this.scene);
        material.diffuseTexture = new Texture(texturePath, this.scene);
        material.diffuseTexture.hasAlpha = true;
        material.useAlphaFromDiffuseTexture = true;
        material.emissiveTexture = new Texture(texturePath, this.scene);
        // Add a red tint to make boss look different
        material.emissiveColor = new Color3(0.3, 0, 0);
        material.backFaceCulling = false;

        this.mesh.material = material;
        this.mesh.position = this.position;

        // Boss always faces camera
        this.mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
    }

    public update(deltaTime: number): void {
        this.patternTime += deltaTime;
        this.shootCooldown -= deltaTime;

        // Change phase based on health
        if (this.health <= this.maxHealth * 0.3) {
            this.phase = 2; // Enraged phase
        } else if (this.health <= this.maxHealth * 0.6) {
            this.phase = 1; // Aggressive phase
        }

        // Movement patterns based on phase
        switch (this.phase) {
            case 0: // Normal - slow side to side
                this.position.x += this.direction * this.speed * deltaTime;
                if (Math.abs(this.position.x) > 6) {
                    this.direction *= -1;
                }
                break;

            case 1: // Aggressive - faster zigzag
                this.position.x += this.direction * this.speed * 1.5 * deltaTime;
                this.position.y = 5 + Math.sin(this.patternTime * 2) * 1.5;
                if (Math.abs(this.position.x) > 6) {
                    this.direction *= -1;
                }
                break;

            case 2: // Enraged - erratic movement
                this.position.x += Math.sin(this.patternTime * 3) * this.speed * 2 * deltaTime;
                this.position.y = 5 + Math.sin(this.patternTime * 4) * 2;
                break;
        }

        // Update mesh position
        this.mesh.position.copyFrom(this.position);

        // Update color based on damage (more red = more damage)
        const healthPercent = this.health / this.maxHealth;
        const material = this.mesh.material as StandardMaterial;
        if (material) {
            material.emissiveColor = new Color3(0.5 * (1 - healthPercent), 0, 0);
        }
    }

    public shoot(): Projectile[] {
        const projectiles: Projectile[] = [];

        if (this.shootCooldown > 0) {
            return projectiles;
        }

        // Shoot pattern based on phase
        switch (this.phase) {
            case 0: // Normal - single shot
                this.shootCooldown = 1.5;
                projectiles.push(this.createProjectile(0));
                break;

            case 1: // Aggressive - triple shot
                this.shootCooldown = 1.2;
                projectiles.push(this.createProjectile(-0.5));
                projectiles.push(this.createProjectile(0));
                projectiles.push(this.createProjectile(0.5));
                break;

            case 2: // Enraged - spread shot
                this.shootCooldown = 0.8;
                for (let i = -2; i <= 2; i++) {
                    projectiles.push(this.createProjectile(i * 0.4));
                }
                break;
        }

        return projectiles;
    }

    private createProjectile(xOffset: number): Projectile {
        const projectilePos = this.position.clone();
        projectilePos.y -= 1.5;
        projectilePos.x += xOffset;
        return new Projectile(this.scene, projectilePos, false);
    }

    public takeDamage(): boolean {
        this.health--;
        return this.health <= 0;
    }

    public dispose(): void {
        this.mesh.dispose();
    }
}
