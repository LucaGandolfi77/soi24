import { CSSProperties } from 'react'
import { BallPosition } from './interfaces'

// GAME DATA

//export const PLAYFIELD_WIDTH = 1000
//export const PLAYFIELD_HEIGHT = 750
export const PLAYFIELD_WIDTH = 800
export const PLAYFIELD_HEIGHT = 600

export const FPS = 60
// ms between frames
export const MS_PER_FRAME = 1000 / FPS

export const BALL_DIAMETER = 20
export const BALL_RADIUS = BALL_DIAMETER / 2
// unit per sec
export const BALL_SPEED = PLAYFIELD_WIDTH / 4

export const PLAYER_WIDTH = 10
export const PLAYER_HEIGHT = 200
export const PLAYER_RADIUS = Math.min(PLAYER_WIDTH, PLAYER_HEIGHT) / 2
// unit per sec
export const PLAYER_SPEED = PLAYFIELD_HEIGHT / 2
// unit per frame
export const PLAYER_STEP = Math.floor(PLAYER_SPEED / FPS)

export const LEFT_TEAM_X = Math.floor(PLAYFIELD_WIDTH / 20)
export const RIGHT_TEAM_X = Math.floor(PLAYFIELD_WIDTH - LEFT_TEAM_X)

export const INITIAL_BALL_DIRECTION = Math.PI

export const INITIAL_BALL_POS: BallPosition = Object.freeze({
    y: PLAYFIELD_HEIGHT / 2,
    x: PLAYFIELD_WIDTH / 2,
})

export const INITIAL_PLAYER_POS_Y = Math.floor(PLAYFIELD_HEIGHT / 2)

// PLAYFIELD STYLE

export const PLAYFIELD_SVG_VIEWBOX = `0 0 ${PLAYFIELD_WIDTH} ${PLAYFIELD_HEIGHT}`
export const PLAYFIELD_SVG_WIDTH = '100vmin'
export const PLAYFIELD_SVG_HEIGHT = '75vmin'

export const PLAYFIELD_STYLE: CSSProperties = Object.freeze({
    position: 'relative',
    backgroundColor: '#E0E0E0'
})

// TEAM COLORS
export const LEFT_TEAM_COLOR = '#4169E1'  // Royal Blue
export const RIGHT_TEAM_COLOR = '#32CD32' // Lime Green

// BALL STYLE
export const BALL_BASE_SVG_PROPS: React.SVGProps<SVGCircleElement> = Object.freeze({
    fill: '#FF2C07',
    r: BALL_RADIUS,
})

// PLAYER STYLE
export const LEFT_PLAYER_SVG_PROPS: React.SVGProps<SVGRectElement> = Object.freeze({
    rx: PLAYER_RADIUS,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    fill: LEFT_TEAM_COLOR,
})

export const RIGHT_PLAYER_SVG_PROPS: React.SVGProps<SVGRectElement> = Object.freeze({
    rx: PLAYER_RADIUS,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    fill: RIGHT_TEAM_COLOR,
})

// SCOREBOARD STYLE
export const SCOREBOARD_STYLE: CSSProperties = Object.freeze({
    position: 'absolute',
    top: '20px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 50px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
})
