import {
    Scene,
    Vector3,
    ParticleSystem as BabylonParticleSystem,
    Texture,
    Color4,
    MeshBuilder
} from '@babylonjs/core';

export class ExplosionSystem {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public createExplosion(position: Vector3, size: number = 1): void {
        // Create a particle system for explosion
        const particleSystem = new BabylonParticleSystem('explosion', 100, this.scene);

        // Create emitter
        const emitter = MeshBuilder.CreateBox('emitter', { size: 0.01 }, this.scene);
        emitter.position = position.clone();
        emitter.isVisible = false;
        particleSystem.emitter = emitter;

        // Texture (create a simple circle texture procedurally)
        particleSystem.particleTexture = this.createParticleTexture();

        // Colors - fire/explosion colors
        particleSystem.color1 = new Color4(1, 0.8, 0, 1);      // Yellow
        particleSystem.color2 = new Color4(1, 0.3, 0, 1);      // Orange
        particleSystem.colorDead = new Color4(0.2, 0, 0, 0);   // Dark red, fade out

        // Size
        particleSystem.minSize = 0.1 * size;
        particleSystem.maxSize = 0.5 * size;

        // Lifetime
        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 0.5;

        // Emission
        particleSystem.emitRate = 500;
        particleSystem.manualEmitCount = 50;

        // Speed
        particleSystem.minEmitPower = 2 * size;
        particleSystem.maxEmitPower = 5 * size;

        // Direction - radial explosion
        particleSystem.direction1 = new Vector3(-1, -1, -1);
        particleSystem.direction2 = new Vector3(1, 1, 1);

        // Gravity
        particleSystem.gravity = new Vector3(0, -2, 0);

        // Angular speed
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI * 2;

        // Blend mode for additive glow
        particleSystem.blendMode = BabylonParticleSystem.BLENDMODE_ADD;

        // Start and auto dispose
        particleSystem.start();

        // Stop emitting after a short burst and dispose
        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => {
                particleSystem.dispose();
                emitter.dispose();
            }, 600);
        }, 100);
    }

    public createSmallExplosion(position: Vector3): void {
        this.createExplosion(position, 0.5);
    }

    public createLargeExplosion(position: Vector3): void {
        this.createExplosion(position, 2);
    }

    private createParticleTexture(): Texture {
        // Create a canvas to draw the particle texture
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        // Draw a radial gradient circle
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Create texture from canvas
        const texture = new Texture('data:' + canvas.toDataURL(), this.scene, false, false);
        texture.hasAlpha = true;

        return texture;
    }

    // Spark effect for projectile hits
    public createSparks(position: Vector3): void {
        const particleSystem = new BabylonParticleSystem('sparks', 30, this.scene);

        const emitter = MeshBuilder.CreateBox('sparkEmitter', { size: 0.01 }, this.scene);
        emitter.position = position.clone();
        emitter.isVisible = false;
        particleSystem.emitter = emitter;

        particleSystem.particleTexture = this.createParticleTexture();

        particleSystem.color1 = new Color4(1, 1, 0, 1);
        particleSystem.color2 = new Color4(1, 1, 1, 1);
        particleSystem.colorDead = new Color4(1, 0.5, 0, 0);

        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.15;

        particleSystem.minLifeTime = 0.1;
        particleSystem.maxLifeTime = 0.2;

        particleSystem.emitRate = 200;
        particleSystem.manualEmitCount = 20;

        particleSystem.minEmitPower = 3;
        particleSystem.maxEmitPower = 6;

        particleSystem.direction1 = new Vector3(-1, -1, -1);
        particleSystem.direction2 = new Vector3(1, 1, 1);

        particleSystem.blendMode = BabylonParticleSystem.BLENDMODE_ADD;

        particleSystem.start();

        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => {
                particleSystem.dispose();
                emitter.dispose();
            }, 300);
        }, 50);
    }
}
