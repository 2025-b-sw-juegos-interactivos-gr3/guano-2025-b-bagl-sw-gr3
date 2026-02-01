export class ScoreManager {
    private score: number = 0;
    private static STORAGE_KEY = 'space_defender_scores';

    constructor() {
        this.updateUI();
    }

    public addScore(points: number): void {
        this.score += points;
        this.updateUI();
    }

    public getScore(): number {
        return this.score;
    }

    public reset(): void {
        this.score = 0;
        this.updateUI();
    }

    public saveFinalScore(): void {
        try {
            const raw = window.localStorage.getItem(ScoreManager.STORAGE_KEY);
            const list = raw ? JSON.parse(raw) as { score: number; date: string }[] : [];
            list.push({ score: this.score, date: new Date().toISOString() });
            window.localStorage.setItem(ScoreManager.STORAGE_KEY, JSON.stringify(list));
        } catch {
            // Ignorar errores de localStorage (modo privado, etc.)
        }
    }

    public static getScores(): { score: number; date: string }[] {
        try {
            const raw = window.localStorage.getItem(ScoreManager.STORAGE_KEY);
            return raw ? JSON.parse(raw) as { score: number; date: string }[] : [];
        } catch {
            return [];
        }
    }

    private updateUI(): void {
        const scoreElement = document.getElementById('score-count');
        if (scoreElement) {
            scoreElement.textContent = this.score.toString();
        }
    }
}
