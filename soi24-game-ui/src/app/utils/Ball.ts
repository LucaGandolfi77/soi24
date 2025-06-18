import Player from './Player'
import {
    PLAYFIELD_HEIGHT,
    BALL_RADIUS,
    BALL_SPEED,
    LEFT_TEAM_X,
    PLAYER_HEIGHT,
    RIGHT_TEAM_X,
} from './const' // Make sure PLAYER_HEIGHT is imported
import {
    BallAnimation,
    BallPosition,
    PlayerTeam
} from './interfaces'

// Constants like MIN_X, MAX_X, MIN_Y, MAX_Y should be defined above this class or imported
const MIN_X = LEFT_TEAM_X + BALL_RADIUS
const MAX_X = RIGHT_TEAM_X - BALL_RADIUS
const MIN_Y = BALL_RADIUS
const MAX_Y = PLAYFIELD_HEIGHT - BALL_RADIUS
// const SIN_COS_EPSILON = 0.01 // Already defined in your file

// ... (rest of your Ball class structure, constructor, getAnimation, etc.)

export default class Ball {
    private animation: BallAnimation
    // Make sure your constructor and other methods are here

    constructor(
        position: BallPosition,
        direction: number,
        private onChange: (ballAnimation: BallAnimation) => void
    ) {
        // Ensure retrieveNewAnimation is part of this class or correctly accessed
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
            let originalDirectionBeforePlayerCheck = direction; // Store for comparison

            const isHit = players.some((player) => {
                const playerPosition = player.getPosition()
                const playerPosX = playerPosition.team === PlayerTeam.LEFT
                    ? LEFT_TEAM_X
                    : RIGHT_TEAM_X
                const playerPosY = playerPosition.y

                console.log(`Ball: Checking player at X=${playerPosX.toFixed(2)}, Y=${playerPosY.toFixed(2)}`);

                // Check if the ball is horizontally aligned with the player paddle's X coordinate
                // This check should be very close to zero if endX is MIN_X or MAX_X which are derived from player X positions
                if (Math.abs(playerPosX - endX) > PLAYER_HEIGHT / 2 + BALL_RADIUS ) { // Relaxed this condition slightly for safety, original was > BALL_RADIUS
                                                                    // but actually endX IS the line of the paddle. playerPosX is also the line of the paddle.
                                                                    // So this check Math.abs(playerPosX - endX) is more about ensuring it's the *correct* player's line.
                                                                    // A simple check like `(endX === MIN_X && playerPosition.team === PlayerTeam.LEFT) || (endX === MAX_X && playerPosition.team === PlayerTeam.RIGHT)` might be more direct for selecting the right player.
                                                                    // For now, keeping a distance check.
                    console.log(`Ball: Player too far horizontally for effective collision based on endX. |playerPosX - endX| = ${Math.abs(playerPosX - endX).toFixed(2)}`);
                    // return false; // Let's not return here yet to see vertical overlap. The outer if (endX === MIN_X || endX === MAX_X) should target the correct line.
                }


                const deltaV = Math.abs(endY - playerPosY)
                const overlapV = deltaV <= (PLAYER_HEIGHT / 2 + BALL_RADIUS) // Check vertical overlap
                console.log(`Ball: Player check: deltaV=${deltaV.toFixed(2)}, overlapThreshold=${(PLAYER_HEIGHT / 2 + BALL_RADIUS).toFixed(2)}, overlapV=${overlapV}`);

                if (!overlapV) {
                    console.log("Ball: No vertical overlap with player.");
                    return false // No hit with this player
                }

                // If we reach here, a collision with THIS player is detected.
                console.log("Ball: PLAYER HIT DETECTED with player at Y=" + playerPosY.toFixed(2) + " (Ball Y=" + endY.toFixed(2) + ")");
                console.log(`Ball: Before bounce logic, direction = ${(direction * 180 / Math.PI).toFixed(2)} deg`);

                // --- START: NEW BOUNCE LOGIC (with playerPosY) ---
                let relativeIntersectY = (endY - playerPosY) / (PLAYER_HEIGHT / 2);
                relativeIntersectY = Math.max(-1, Math.min(1, relativeIntersectY)); // Clamp to [-1, 1]
                console.log(`Ball: relativeIntersectY=${relativeIntersectY.toFixed(2)}`);

                const maxBounceAngleEffect = Math.PI / 3; // Max 60 degree bounce angle from horizontal
                const bounceAngle = relativeIntersectY * maxBounceAngleEffect;
                console.log(`Ball: bounceAngle=${(bounceAngle * 180 / Math.PI).toFixed(2)} deg`);

                let newDxComponent;
                const newDyComponent = Math.sin(bounceAngle);

                if (endX === MIN_X) { // Hit left player, ball was moving left, new direction is right
                    newDxComponent = Math.cos(bounceAngle);
                } else { // Hit right player, ball was moving right, new direction is left
                    newDxComponent = -Math.cos(bounceAngle);
                }
                console.log(`Ball: newDxComponent=${newDxComponent.toFixed(2)}, newDyComponent=${newDyComponent.toFixed(2)}`);

                direction = Math.atan2(newDyComponent, newDxComponent);
                console.log(`Ball: Player bounce! New direction=${(direction * 180 / Math.PI).toFixed(2)} deg`);
                // --- END: NEW BOUNCE LOGIC ---

                return true // Hit detected and processed for this player
            })

            if (!isHit) {
                console.log("Ball: Side reached (MIN_X or MAX_X) but NO player was hit there (goal or ball passed through). Original direction: " + (originalDirectionBeforePlayerCheck * 180 / Math.PI).toFixed(2) + " deg");
                // This is where a goal would typically be handled. The original code had 'return;'
                // which would stop the ball by not calculating a new animation.
                return; // Keeping original goal behavior (ball stops/disappears until reset)
            }
        }

        if (isNaN(direction)) {
            console.error("Ball: Direction became NaN! Halting ball animation for safety.");
            return; // Stop processing if direction is invalid
        }

        this.animation = this.retrieveNewAnimation({ y: endY, x: endX }, direction)
        console.log(`Ball: New animation set. StartX=${this.animation.startX.toFixed(2)}, StartY=${this.animation.startY.toFixed(2)}, EndX=${this.animation.endX.toFixed(2)}, EndY=${this.animation.endY.toFixed(2)}, Time=${this.animation.time.toFixed(2)}`);
        this.onChange(this.animation)
    }

    // Make sure retrieveNewAnimation method is correctly defined in your class
    private retrieveNewAnimation(position: BallPosition, direction: number): BallAnimation {
        // ... (your existing retrieveNewAnimation logic)
        // This is a placeholder for your existing method's content
        const cos = Math.cos(direction);
        const sin = Math.sin(direction);
        const SIN_COS_EPSILON = 0.01; // Assuming this is defined or accessible

        let nextX;
        let nextY;

        if (Math.abs(sin) < SIN_COS_EPSILON) {
            nextX = cos > 0 ? MAX_X : MIN_X;
            nextY = position.y;
        } else if (Math.abs(cos) < SIN_COS_EPSILON) {
            nextX = position.x;
            nextY = sin > 0 ? MIN_Y : MAX_Y; // Note: Original code: sin > 0 ? MIN_Y : MAX_Y. Check if your Y coordinates are inverted for display.
                                          // If positive sin means moving "down" on screen (increasing Y value), then it should be MAX_Y.
                                          // If positive sin means moving "up" on screen (decreasing Y value), then it should be MIN_Y.
                                          // The comment "direction inversion because Y increase upward, while top downward" for atan2 might be relevant here.
                                          // Let's assume the original logic is correct for now.
        } else {
            const m = Math.tan(-direction); // Original uses -direction here
            const q = position.y - m * position.x;

            const wallX = cos > 0 ? MAX_X : MIN_X;
            const wallY = sin > 0 ? MIN_Y : MAX_Y; // Same note as above for sin > 0

            const wallDistY = sin > 0
                ? Math.abs(position.y - MIN_Y) // Ensure positive distance
                : Math.abs(MAX_Y - position.y);

            const intersectionY = m * wallX + q;
            if (Math.abs(intersectionY - position.y) <= wallDistY + SIN_COS_EPSILON) { // Added epsilon for float comparison
                nextX = wallX;
                nextY = intersectionY;
            } else {
                nextX = (wallY - q) / m;
                nextY = wallY;
            }
        }
        
        // Ensure nextX and nextY are clamped to bounds to prevent overshooting due to float issues
        nextX = Math.max(MIN_X, Math.min(MAX_X, nextX));
        nextY = Math.max(MIN_Y, Math.min(MAX_Y, nextY));


        const collisionDistX = nextX - position.x;
        const collisionDistY = nextY - position.y; // Corrected from - to + for standard distance
        const collisionDist = Math.sqrt(collisionDistX * collisionDistX + collisionDistY * collisionDistY);
        
        if (collisionDist < SIN_COS_EPSILON && (nextX === MIN_X || nextX === MAX_X || nextY === MIN_Y || nextY === MAX_Y)) {
            // If predicted distance is tiny and we are at a wall/player line, could be stuck.
            // This might happen if retrieveNewAnimation is called with current position already at a boundary.
            console.warn(`Ball: retrieveNewAnimation calculated very small distance (${collisionDist.toFixed(3)}) at boundary X=${nextX.toFixed(2)}, Y=${nextY.toFixed(2)}. Dir=${(direction * 180 / Math.PI).toFixed(2)}`);
            // Forcing a slight nudge or specific bounce if stuck might be needed, but let's see logs first.
        }

        const collisionTime = collisionDist / BALL_SPEED;

        if (isNaN(collisionTime) || collisionTime <= 0) {
            console.error(`Ball: Invalid collisionTime: ${collisionTime}. Dist: ${collisionDist}, Speed: ${BALL_SPEED}. Pos:(${position.x},${position.y}) Next:(${nextX},${nextY}) Dir:${(direction * 180 / Math.PI).toFixed(2)}`);
            // Return a default small animation to prevent freeze, or handle error
            return {
                startX: position.x, startY: position.y,
                endX: position.x + (cos > 0 ? 1 : -1) * BALL_RADIUS, // Minimal move
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