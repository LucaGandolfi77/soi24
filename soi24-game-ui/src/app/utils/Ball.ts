import Player from './Player'
import {
    PLAYFIELD_HEIGHT,
    BALL_RADIUS,
    BALL_SPEED,
    LEFT_TEAM_X,
    PLAYER_HEIGHT,
    RIGHT_TEAM_X,
    PLAYFIELD_WIDTH,
    PLAYFIELD_STYLE,
} from './const'
import {
    BallAnimation,
    BallPosition,
    PlayerTeam
} from './interfaces'

const MIN_X = LEFT_TEAM_X + BALL_RADIUS
const MAX_X = RIGHT_TEAM_X - BALL_RADIUS
const MIN_Y = BALL_RADIUS
const MAX_Y = PLAYFIELD_HEIGHT - BALL_RADIUS

export default class Ball {
    private animation: BallAnimation

    constructor(
        position: BallPosition,
        direction: number,
        private onChange: (ballAnimation: BallAnimation | null) => void
    ) {
        this.animation = this.retrieveNewAnimation(position, direction)
    }

    public getAnimation() {
        return this.animation
    }

    /**
     * To call only when last animation ended
     */
    public animate(players: Player[]) {
        const {
            startX,
            startY,
            endX,
            endY,
        } = this.animation

        // direction inversion because Y increase upward, while top downward
        let direction = Math.atan2(-endY + startY, endX - startX)
        console.log(`Ball animate: Initial endX=${endX.toFixed(2)}, endY=${endY.toFixed(2)}, initial direction=${(direction * 180 / Math.PI).toFixed(2)} deg`);

        // Collision detection with walls
        if (endY === MIN_Y || endY === MAX_Y) {
            console.log("Ball: Wall collision detected.");
            direction *= -1
        }

        // Collision detection with players
        if (endX === MIN_X || endX === MAX_X) {
            console.log(`Ball: Potential player collision zone. endX=${endX.toFixed(2)}`);
            let originalDirectionBeforePlayerCheck = direction;
        
            const isHit = players.some((player, playerIndex) => {
                const playerPosition = player.getPosition()
                const playerPosX = playerPosition.team === PlayerTeam.LEFT
                    ? LEFT_TEAM_X
                    : RIGHT_TEAM_X
                const playerPosY = playerPosition.y
        
                // Identifica quale player stiamo controllando
                const playerTeamName = playerPosition.team === PlayerTeam.LEFT ? "LEFT (Player 1)" : "RIGHT (Player 2)";
                console.log(`Ball: Checking ${playerTeamName} at X=${playerPosX.toFixed(2)}, Y=${playerPosY.toFixed(2)}`);
        
                // Verifica se è il player corretto per questa collisione
                const isCorrectPlayer = (endX === MIN_X && playerPosition.team === PlayerTeam.LEFT) ||
                                       (endX === MAX_X && playerPosition.team === PlayerTeam.RIGHT);
                
                if (!isCorrectPlayer) {
                    console.log(`Ball: Skipping ${playerTeamName} - not the target for this collision`);
                    return false;
                }
        
                const deltaV = Math.abs(endY - playerPosY)
                const overlapV = deltaV <= (PLAYER_HEIGHT / 2 + BALL_RADIUS)
                console.log(`Ball: ${playerTeamName} check: deltaV=${deltaV.toFixed(2)}, overlapThreshold=${(PLAYER_HEIGHT / 2 + BALL_RADIUS).toFixed(2)}, overlapV=${overlapV}`);
        
                if (!overlapV) {
                    console.log(`Ball: No vertical overlap with ${playerTeamName}.`);
                    return false
                }
        
                // *** LOGGING DELLA COLLISIONE ***
                console.log(`🏓 COLLISION DETECTED! ${playerTeamName} hit the ball!`);
                console.log(`   Player position: X=${playerPosX.toFixed(2)}, Y=${playerPosY.toFixed(2)}`);
                console.log(`   Ball position: X=${endX.toFixed(2)}, Y=${endY.toFixed(2)}`);
                console.log(`   Player index: ${playerIndex}`);
                
                // Resto della logica di rimbalzo...
                let relativeIntersectY = (endY - playerPosY) / (PLAYER_HEIGHT / 2);
                relativeIntersectY = Math.max(-1, Math.min(1, relativeIntersectY));
                
                const maxBounceAngleEffect = Math.PI / 3;
                const bounceAngle = relativeIntersectY * maxBounceAngleEffect;
                
                let newDxComponent;
                const newDyComponent = Math.sin(bounceAngle);
        
                if (endX === MIN_X) {
                    newDxComponent = Math.cos(bounceAngle);
                    console.log(`🏓 ${playerTeamName} bounced ball to the RIGHT`);
                } else {
                    newDxComponent = -Math.cos(bounceAngle);
                    console.log(`🏓 ${playerTeamName} bounced ball to the LEFT`);
                }
        
                direction = Math.atan2(newDyComponent, newDxComponent);
                console.log(`🏓 New ball direction: ${(direction * 180 / Math.PI).toFixed(2)} degrees`);
                
                return true
            })
        
            if (!isHit) {
                // Create confetti animation
                this.createConfettiAnimation(endX <= MIN_X ? RIGHT_TEAM_X : LEFT_TEAM_X);
                
                // Signal goal and prepare next round
                this.onChange(null);
                this.animation = this.retrieveNewAnimation(
                    { x: PLAYFIELD_WIDTH / 2, y: PLAYFIELD_HEIGHT / 2 },
                    endX <= MIN_X ? Math.PI : 0  // Ball moves towards losing side
                );
                
                // Minimal delay to ensure goal is processed
                requestAnimationFrame(() => this.onChange(this.animation));
                return;
            }
        }

        if (isNaN(direction)) {
            console.error("Ball: Direction became NaN! Halting ball animation for safety.");
            return;
        }

        this.animation = this.retrieveNewAnimation({ y: endY, x: endX }, direction)
        console.log(`Ball: New animation set. StartX=${this.animation.startX.toFixed(2)}, StartY=${this.animation.startY.toFixed(2)}, EndX=${this.animation.endX.toFixed(2)}, EndY=${this.animation.endY.toFixed(2)}, Time=${this.animation.time.toFixed(2)}`);
        this.onChange(this.animation)
    }

    /**
     * 🎯 Crea un'animazione spettacolare per il goal
     */
    private createGoalAnimation(goalX: number, goalY: number) {
        console.log("🎉 CREATING GOAL ANIMATION!");
        
        // Determina da che parte è stato il goal
        const isLeftGoal = goalX <= LEFT_TEAM_X;
        const scoringPlayer = isLeftGoal ? "Player 2" : "Player 1";
        
        // Animazione 1: Palla che "esplode" verso l'esterno dello schermo
        const explosionEndX = isLeftGoal ? -BALL_RADIUS * 3 : PLAYFIELD_WIDTH + BALL_RADIUS * 3;
        const explosionEndY = goalY + (Math.random() - 0.5) * 200; // Variazione random
        
        // Crea keyframes CSS dinamici per l'esplosione
        const goalAnimationCSS = `
            @keyframes goalExplosion {
                0% {
                    cx: ${goalX}px;
                    cy: ${goalY}px;
                    r: ${BALL_RADIUS}px;
                    fill: #FF2C07;
                    filter: drop-shadow(0 0 0 transparent);
                }
                25% {
                    r: ${BALL_RADIUS * 1.5}px;
                    fill: #FFD700;
                    filter: drop-shadow(0 0 20px #FFD700);
                }
                50% {
                    r: ${BALL_RADIUS * 2}px;
                    fill: #FF4500;
                    filter: drop-shadow(0 0 40px #FF4500);
                }
                75% {
                    cx: ${goalX + (explosionEndX - goalX) * 0.7}px;
                    cy: ${explosionEndY}px;
                    r: ${BALL_RADIUS * 1.2}px;
                    fill: #FF6B6B;
                    filter: drop-shadow(0 0 60px #FF6B6B);
                }
                100% {
                    cx: ${explosionEndX}px;
                    cy: ${explosionEndY}px;
                    r: ${BALL_RADIUS * 0.1}px;
                    fill: transparent;
                    filter: drop-shadow(0 0 100px #FFD700);
                }
            }
        `;

        // Inietta il CSS nell'head del documento
        const styleElement = document.createElement('style');
        styleElement.textContent = goalAnimationCSS;
        document.head.appendChild(styleElement);

        // Crea l'animazione goal con CSS personalizzato
        this.animation = {
            startX: goalX,
            startY: goalY,
            endX: explosionEndX,
            endY: explosionEndY,
            time: 2.0 // Durata animazione goal
        };

        // Aggiorna le proprietà CSS per l'animazione goal
        document.documentElement.style.setProperty('--ball-end-x', `${explosionEndX}`);
        document.documentElement.style.setProperty('--ball-end-y', `${explosionEndY}`);

        // Override temporaneo dell'animazione con quella di goal
        const originalOnChange = this.onChange;
        this.onChange = (ballAnimation: BallAnimation | null) => {
            if (ballAnimation === null) {
                originalOnChange(null);
                return;
            }
            
            const goalBallAnimation = {
                ...ballAnimation,
                // Usa proprietà CSS custom per l'animazione goal
            };
            
            // Applica stili speciali per l'animazione goal
            setTimeout(() => {
                const ballElement = document.querySelector('circle[r="' + BALL_RADIUS + '"]') as SVGCircleElement;
                if (ballElement) {
                    ballElement.style.animationName = 'goalExplosion';
                    ballElement.style.animationDuration = '2s';
                    ballElement.style.animationTimingFunction = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    ballElement.style.animationFillMode = 'forwards';
                    
                    // Dopo l'animazione, resetta tutto
                    setTimeout(() => {
                        ballElement.style.animationName = '';
                        styleElement.remove(); // Rimuovi il CSS temporaneo
                        
                        // Resetta la palla al centro per il prossimo round
                        this.animation = this.retrieveNewAnimation(
                            { x: PLAYFIELD_WIDTH / 2, y: PLAYFIELD_HEIGHT / 2 },
                            Math.PI * (Math.random() > 0.5 ? 1 : -1) // Direzione casuale
                        );
                        originalOnChange(this.animation);
                    }, 2000);
                }
            }, 50);
            
            originalOnChange(goalBallAnimation);
        };

        // Mostra messaggio di goal in console con stile
        console.log(`
        🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯
        🎉    G O A L ! ! !    🎉
        🏆 ${scoringPlayer} SCORED! 🏆
        🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯
        `);

        this.onChange(this.animation);
    }

    private createConfettiAnimation(scoringX: number) {
        const confettiCount = 150;  // Number of confetti particles
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590']; // Rainbow colors
        const glitterColors = ['#FFD700', '#FFF', '#F0F8FF']; // Gold, White, and Alice Blue for glitter

        const confettiKeyframes = Array.from({ length: confettiCount }).map((_, i) => {
            const color = i % 3 === 0 ? 
                glitterColors[Math.floor(Math.random() * glitterColors.length)] : 
                colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const startX = scoringX + (Math.random() - 0.5) * PLAYFIELD_WIDTH / 4;
            const endX = startX + (Math.random() - 0.5) * PLAYFIELD_WIDTH / 2;
            const rotateStart = Math.random() * 360;
            const rotateEnd = rotateStart + Math.random() * 720 - 360;
            const delay = Math.random() * 3;
            const duration = Math.random() + 2;

            return `
                @keyframes confetti-${i} {
                    0% {
                        transform: translate(${startX}px, -20px) rotate(${rotateStart}deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(${endX}px, ${PLAYFIELD_HEIGHT + 20}px) rotate(${rotateEnd}deg);
                        opacity: 0;
                    }
                }
            `;
        }).join('\n');

        // Create and add confetti elements
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'absolute';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';

        // Add confetti style
        const styleElement = document.createElement('style');
        styleElement.textContent = confettiKeyframes;
        document.head.appendChild(styleElement);

        Array.from({ length: confettiCount }).forEach((_, i) => {
            const confetti = document.createElement('div');
            const color = i % 3 === 0 ? 
                glitterColors[Math.floor(Math.random() * glitterColors.length)] : 
                colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const delay = Math.random() * 3;
            const duration = Math.random() * 2 + 2;

            Object.assign(confetti.style, {
                position: 'absolute',
                width: size + 'px',
                height: size + 'px',
                backgroundColor: color,
                borderRadius: i % 3 === 0 ? '50%' : '2px',
                animation: `confetti-${i} ${duration}s ease-in ${delay}s forwards`,
                boxShadow: i % 3 === 0 ? '0 0 10px 2px ' + color : 'none',
                opacity: '0'
            });

            confettiContainer.appendChild(confetti);
        });

        document.querySelector('.game-playfield')?.appendChild(confettiContainer);

        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.remove();
            styleElement.remove();
        }, 6000);
    }

    private retrieveNewAnimation(position: BallPosition, direction: number): BallAnimation {
        const cos = Math.cos(direction);
        const sin = Math.sin(direction);
        const SIN_COS_EPSILON = 0.01;

        let nextX;
        let nextY;

        if (Math.abs(sin) < SIN_COS_EPSILON) {
            nextX = cos > 0 ? MAX_X : MIN_X;
            nextY = position.y;
        } else if (Math.abs(cos) < SIN_COS_EPSILON) {
            nextX = position.x;
            nextY = sin > 0 ? MIN_Y : MAX_Y;
        } else {
            const m = Math.tan(-direction);
            const q = position.y - m * position.x;

            const wallX = cos > 0 ? MAX_X : MIN_X;
            const wallY = sin > 0 ? MIN_Y : MAX_Y;

            const wallDistY = sin > 0
                ? Math.abs(position.y - MIN_Y)
                : Math.abs(MAX_Y - position.y);

            const intersectionY = m * wallX + q;
            if (Math.abs(intersectionY - position.y) <= wallDistY + SIN_COS_EPSILON) {
                nextX = wallX;
                nextY = intersectionY;
            } else {
                nextX = (wallY - q) / m;
                nextY = wallY;
            }
        }
        
        nextX = Math.max(MIN_X, Math.min(MAX_X, nextX));
        nextY = Math.max(MIN_Y, Math.min(MAX_Y, nextY));

        const collisionDistX = nextX - position.x;
        const collisionDistY = nextY - position.y;
        const collisionDist = Math.sqrt(collisionDistX * collisionDistX + collisionDistY * collisionDistY);
        
        if (collisionDist < SIN_COS_EPSILON && (nextX === MIN_X || nextX === MAX_X || nextY === MIN_Y || nextY === MAX_Y)) {
            console.warn(`Ball: retrieveNewAnimation calculated very small distance (${collisionDist.toFixed(3)}) at boundary X=${nextX.toFixed(2)}, Y=${nextY.toFixed(2)}. Dir=${(direction * 180 / Math.PI).toFixed(2)}`);
        }

        const collisionTime = collisionDist / BALL_SPEED;

        if (isNaN(collisionTime) || collisionTime <= 0) {
            console.error(`Ball: Invalid collisionTime: ${collisionTime}. Dist: ${collisionDist}, Speed: ${BALL_SPEED}. Pos:(${position.x},${position.y}) Next:(${nextX},${nextY}) Dir:${(direction * 180 / Math.PI).toFixed(2)}`);
            return {
                startX: position.x, startY: position.y,
                endX: position.x + (cos > 0 ? 1 : -1) * BALL_RADIUS,
                endY: position.y,
                time: 0.1
            };
        }

        return {
            startX: position.x,
            startY: position.y,
            endX: nextX,
            endY: nextY,
            time: collisionTime,
        };
    }
}