import {
    Scene,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Mesh
} from '@babylonjs/core';

export class Projectile {
    private scene: Scene;
    public mesh: Mesh;
    public position: Vector3;
    public isFromPlayer: boolean;

    private speed: number = 15;

    constructor(scene: Scene, startPos: Vector3, isFromPlayer: boolean) {
        this.scene = scene;
        this.position = startPos.clone();
        this.isFromPlayer = isFromPlayer;

        this.createMesh();
    }

    private createMesh(): void {
        this.mesh = MeshBuilder.CreateBox('projectile', {
            width: 0.1,
            height: 0.4,
            depth: 0.1
        }, this.scene);

        const material = new StandardMaterial('projectileMat', this.scene);

        if (this.isFromPlayer) {
            material.emissiveColor = new Color3(0, 1, 1); // Cyan for player
        } else {
            material.emissiveColor = new Color3(1, 0, 0); // Red for enemy
        }

        this.mesh.material = material;
        this.mesh.position = this.position;
    }

    public update(deltaTime: number): void {
        if (this.isFromPlayer) {
            this.position.y += this.speed * deltaTime;
        } else {
            this.position.y -= this.speed * deltaTime;
        }

        this.mesh.position.copyFrom(this.position);
    }

    public dispose(): void {
        this.mesh.dispose();
    }
}
