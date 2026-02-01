import {
    Scene,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Mesh
} from '@babylonjs/core';

export enum PowerUpType {
    MoveSpeed = 'MoveSpeed',
    RapidFire = 'RapidFire',
    DoubleShot = 'DoubleShot'
}

export class PowerUp {
    private scene: Scene;
    public mesh: Mesh;
    public position: Vector3;
    public type: PowerUpType;

    private fallSpeed: number = 3;

    constructor(scene: Scene, startPos: Vector3, type: PowerUpType) {
        this.scene = scene;
        this.position = startPos.clone();
        this.type = type;

        this.mesh = this.createMesh();
        this.mesh.position = this.position.clone();
    }

    private createMesh(): Mesh {
        const mesh = MeshBuilder.CreateSphere('powerup', { diameter: 0.7 }, this.scene);
        const material = new StandardMaterial('powerupMat', this.scene);

        switch (this.type) {
            case PowerUpType.MoveSpeed:
                material.emissiveColor = new Color3(0, 0.7, 1); // Azul claro - velocidad movimiento
                break;
            case PowerUpType.RapidFire:
                material.emissiveColor = new Color3(1, 1, 0); // Amarillo - velocidad disparo
                break;
            case PowerUpType.DoubleShot:
                material.emissiveColor = new Color3(1, 0, 1); // Magenta - disparo doble
                break;
        }

        mesh.material = material;
        return mesh;
    }

    public update(deltaTime: number): void {
        // Caída hacia el jugador
        this.position.y -= this.fallSpeed * deltaTime;
        this.mesh.position.copyFrom(this.position);
    }

    public dispose(): void {
        this.mesh.dispose();
    }
}