import { Vector3 } from '@babylonjs/core';

export class CollisionSystem {

    public checkCollision(entity1: any, entity2: any): boolean {
        const pos1 = entity1.position;
        const pos2 = entity2.position;

        // Simple radius-based collision
        const radius1 = 0.5;
        const radius2 = 0.5;

        const distance = Vector3.Distance(pos1, pos2);

        return distance < (radius1 + radius2);
    }
}
