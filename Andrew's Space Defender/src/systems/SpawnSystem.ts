import { Scene, Vector3 } from '@babylonjs/core';
import { Enemy } from '../entities/Enemy';

export class SpawnSystem {
    private scene: Scene;
    private bounds: any;

    constructor(scene: Scene, bounds: any) {
        this.scene = scene;
        this.bounds = bounds;
    }

    public spawnEnemy(): Enemy {
        const x = Math.random() * (this.bounds.maxX - this.bounds.minX) + this.bounds.minX;
        const y = this.bounds.maxY;
        const type = Math.floor(Math.random() * 3);

        return new Enemy(this.scene, new Vector3(x, y, 0), type);
    }
}
