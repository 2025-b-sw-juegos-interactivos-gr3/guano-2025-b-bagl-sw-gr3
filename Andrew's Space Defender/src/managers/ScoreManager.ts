export class ScoreManager {
    private score: number = 0;

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

    private updateUI(): void {
        const scoreElement = document.getElementById('score-count');
        if (scoreElement) {
            scoreElement.textContent = this.score.toString();
        }
    }
}
