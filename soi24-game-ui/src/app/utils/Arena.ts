import Ball from './Ball'
import Player from './Player'
import { MS_PER_FRAME, LEFT_TEAM_X, RIGHT_TEAM_X, BALL_RADIUS } from './const'
import { GameScore } from './interfaces'

export default class Arena {
    private msPrevFrame: number
    private isPlaying: boolean
    private ballAnimationEnded: boolean
    private score: GameScore

    constructor(
        private ball: Ball,
        private players: Player[],
        private onScoreChange?: (score: GameScore) => void
    ) {
        this.msPrevFrame = window.performance.now()
        this.isPlaying = false
        this.ballAnimationEnded = false
        this.score = { left: 0, right: 0 }
    }

    public getBall() {
        return this.ball
    }

    public getPlayer(index: number) {
        return this.players.at(index)
    }

    public getScore() {
        return { ...this.score }
    }

    public setBallAnimationEnded(ballAnimationEnded: boolean) {
        this.ballAnimationEnded = ballAnimationEnded
        // Controlla se c'è stato un goal
        if (ballAnimationEnded) {
            this.checkForGoal()
        }
    }

    private checkForGoal() {
        const ballAnimation = this.ball.getAnimation()
        const ballEndX = ballAnimation.endX
        // Controlla se la palla ha raggiunto i bordi (goal)
        if (ballEndX <= LEFT_TEAM_X - BALL_RADIUS) {
            // Goal per il team destro
            this.score.right++
            this.onScoreChange?.(this.getScore())
        } else if (ballEndX >= RIGHT_TEAM_X + BALL_RADIUS) {
            // Goal per il team sinistro
            this.score.left++
            this.onScoreChange?.(this.getScore())
        }
    }

    public resetScore() {
        this.score = { left: 0, right: 0 }
        this.onScoreChange?.(this.getScore())
    }

    public play() {
        if (this.isPlaying === false) {
            this.isPlaying = true
            this.msPrevFrame = window.performance.now()
            this.animate()
        }
    }

    public pause() {
        this.isPlaying = false
    }

    public animate() {
        if (this.isPlaying) {
            window.requestAnimationFrame(this.animate.bind(this))
            const msNow = window.performance.now()
            const msPrev = this.msPrevFrame
            const msDelta = msNow - msPrev

            if (msDelta >= MS_PER_FRAME) {
                this.players.forEach((player) => player.animate())
                if (this.ballAnimationEnded) {
                    this.ball.animate(this.players)
                    this.ballAnimationEnded = false
                }
                const excessTime = msDelta % MS_PER_FRAME
                this.msPrevFrame = msNow - excessTime
            }
        }
    }
}