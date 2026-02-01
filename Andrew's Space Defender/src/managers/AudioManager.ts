import { Scene, Sound } from '@babylonjs/core';

export class AudioManager {
    private scene: Scene;
    private shootSound: Sound | null = null;
    private explosionSound: Sound | null = null;
    private backgroundMusic: Sound | null = null;
    private audioContext: AudioContext | null = null;
    private initialized: boolean = false;

    constructor(scene: Scene) {
        this.scene = scene;
        this.initAudio();
    }

    private initAudio(): void {
        try {
            // Try to load custom sounds if they exist
            this.loadCustomSounds();
        } catch (error) {
            console.log('Custom sounds not found, using generated sounds');
        }
    }

    private loadCustomSounds(): void {
        // Load shoot sound
        this.shootSound = new Sound(
            'shoot',
            '/sounds/disparo.mp3',
            this.scene,
            () => console.log('Shoot sound loaded'),
            { volume: 0.3, autoplay: false }
        );

        // Load explosion sound
        this.explosionSound = new Sound(
            'explosion',
            '/sounds/explosion.mp3',
            this.scene,
            () => console.log('Explosion sound loaded'),
            { volume: 0.4, autoplay: false }
        );

        // Load background music
        this.backgroundMusic = new Sound(
            'bgMusic',
            '/sounds/musica_fondo.mp3',
            this.scene,
            () => {
                console.log('Background music loaded');
                this.backgroundMusic?.play();
            },
            { volume: 0.2, loop: true, autoplay: false }
        );
    }

    public playShoot(): void {
        if (this.shootSound && this.shootSound.isReady()) {
            this.shootSound.play();
        } else {
            this.playGeneratedShoot();
        }
    }

    public playExplosion(): void {
        if (this.explosionSound && this.explosionSound.isReady()) {
            this.explosionSound.play();
        } else {
            this.playGeneratedExplosion();
        }
    }

    public playBackgroundMusic(): void {
        if (this.backgroundMusic && this.backgroundMusic.isReady()) {
            this.backgroundMusic.play();
        } else {
            this.playGeneratedMusic();
        }
    }

    public stopBackgroundMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }
    }

    // ============ GENERATED SOUNDS (Web Audio API) ============
    private getAudioContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    private playGeneratedShoot(): void {
        try {
            const ctx = this.getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not available');
        }
    }

    private playGeneratedExplosion(): void {
        try {
            const ctx = this.getAudioContext();
            
            // Create noise for explosion
            const bufferSize = ctx.sampleRate * 0.3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            noise.start(ctx.currentTime);
        } catch (e) {
            console.log('Audio not available');
        }
    }

    private generatedMusicPlaying: boolean = false;
    private musicInterval: number | null = null;

    private playGeneratedMusic(): void {
        if (this.generatedMusicPlaying) return;
        this.generatedMusicPlaying = true;

        const playNote = (frequency: number, duration: number, delay: number) => {
            try {
                const ctx = this.getAudioContext();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

                gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
                gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

                oscillator.start(ctx.currentTime + delay);
                oscillator.stop(ctx.currentTime + delay + duration);
            } catch (e) { }
        };

        // Simple arcade melody pattern
        const melody = [262, 330, 392, 330, 262, 392, 330, 262]; // C E G E C G E C
        let noteIndex = 0;

        this.musicInterval = window.setInterval(() => {
            playNote(melody[noteIndex], 0.2, 0);
            noteIndex = (noteIndex + 1) % melody.length;
        }, 300);
    }

    public dispose(): void {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
        }
        if (this.shootSound) this.shootSound.dispose();
        if (this.explosionSound) this.explosionSound.dispose();
        if (this.backgroundMusic) this.backgroundMusic.dispose();
    }
}
