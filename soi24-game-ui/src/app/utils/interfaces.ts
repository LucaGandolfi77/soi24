export interface BallPosition {
    x: number,
    y: number,
}

export interface BallAnimation {
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    time: number,
}

export enum PlayerTeam {
    LEFT,
    RIGHT
}

export interface PlayerPosition {
    team: PlayerTeam,
    y: number,
}

export enum PlayerDirection {
    Hold,
    Up,
    Down,
}
