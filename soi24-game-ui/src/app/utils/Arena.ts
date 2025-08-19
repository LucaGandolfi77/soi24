import Ball from './Ball'
import Player from './Player'
import { MS_PER_FRAME } from './const'

export default class Arena {
    private msPrevFrame: number
    private isPlaying: boolean
    private ballAnimationEnded: boolean

    constructor(
        private ball: Ball,
        private players: Player[],
    ) {
        this.msPrevFrame = window.performance.now()
        this.isPlaying = false
        this.ballAnimationEnded = false
    }

    public getBall() {
        return this.ball
    }

    public getPlayer(index: number) {
        return this.players.at(index)
    }

    public setBallAnimationEnded(ballAnimationEnded: boolean) {
        this.ballAnimationEnded = ballAnimationEnded
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
                // Valid frame
                /* TODO - Step 0
                Animate all the players and eventually the ball (only if its last animation ended)
                */
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
