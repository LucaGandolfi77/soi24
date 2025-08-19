import {
    KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import {
    BallAnimation,
    PlayerDirection,
    PlayerPosition,
    PlayerTeam,
    GameScore,
} from '../../utils/interfaces'
import {
    BALL_BASE_SVG_PROPS,
    INITIAL_BALL_DIRECTION,
    INITIAL_BALL_POS,
    INITIAL_PLAYER_POS_Y,
    LEFT_TEAM_X,
    RIGHT_TEAM_X,
    BALL_RADIUS,
} from '../../utils/const'

const MIN_X = LEFT_TEAM_X + BALL_RADIUS
const MAX_X = RIGHT_TEAM_X - BALL_RADIUS
import Arena from '../../utils/Arena'
import Ball from '../../utils/Ball'
import Player from '../../utils/Player'

interface BallProps extends React.SVGProps<SVGCircleElement> {
    style: React.CSSProperties,
}

export default function usePlayField() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [playerLeftPosY, setPlayerLeftPosY] = useState(INITIAL_PLAYER_POS_Y)
    const [playerRightPosY, setPlayerRightPosY] = useState(INITIAL_PLAYER_POS_Y)
    const [ballAnimation, setBallAnimation] = useState<BallAnimation | null>(null)
    const [score, setScore] = useState<GameScore>({ left: 0, right: 0 })

    // Handle scoring when a goal is detected
    const handleGoal = useCallback((endX: number) => {
        setScore(prevScore => ({
            ...prevScore,
            // If ball hits left side (endX <= MIN_X), right team scores, otherwise left team scores
            [endX <= MIN_X ? 'right' : 'left']: prevScore[endX <= MIN_X ? 'right' : 'left'] + 1
        }));
    }, []);

    const arenaRef = useRef<Arena>(new Arena(
        new Ball(INITIAL_BALL_POS, INITIAL_BALL_DIRECTION, (animation) => {
            // Null animation signals a goal
            if (!animation && arenaRef.current) {
                handleGoal(arenaRef.current.getBall().getAnimation().endX);
            }
            setBallAnimation(animation);
        }),
        [
            new Player({ team: PlayerTeam.LEFT, y: INITIAL_PLAYER_POS_Y }, setPlayerLeftPosY),
            new Player({ team: PlayerTeam.RIGHT, y: INITIAL_PLAYER_POS_Y }, setPlayerRightPosY),
            // You can add as many players as you want
        ]
    ))

    const ballProps: BallProps = useMemo(() => {
        const customStyle: React.CSSProperties = {}
        if (ballAnimation !== null) {
            document.documentElement.style.setProperty('--ball-end-y', `${ballAnimation.endY}`)
            document.documentElement.style.setProperty('--ball-end-x', `${ballAnimation.endX}`)
            customStyle.animationName = 'ballAnimation'
            customStyle.animationTimingFunction = 'linear'
            customStyle.animationFillMode = 'forwards'
            customStyle.animationDuration = `${ballAnimation.time}s`
            if (!isPlaying) {
                customStyle.animationPlayState = 'paused'
            }
        } else {
            customStyle.visibility = 'hidden'
        }
        return {
            style: customStyle,
            ...BALL_BASE_SVG_PROPS,
            cx: ballAnimation?.startX,
            cy: ballAnimation?.startY,
        }
    }, [ballAnimation, isPlaying])

    const playerPositions: PlayerPosition[] = useMemo(() => ([
        { team: PlayerTeam.LEFT, y: playerLeftPosY },
        { team: PlayerTeam.RIGHT, y: playerRightPosY },
    ]), [playerLeftPosY, playerRightPosY])

    const handleKeyDown = useCallback(({ key }: KeyboardEvent) => {
        /* TODO - Step 0
        Map the key so that you can:
            - set the moving direction of every player
            - start/stop the game
        */
        switch (key) {
            case 'Enter':
                setIsPlaying((wasPlaying) => !wasPlaying)
                break
            case 'ArrowUp':
                arenaRef.current.getPlayer(1)?.setDirection(PlayerDirection.Up)
                break
            case 'ArrowDown':
                arenaRef.current.getPlayer(1)?.setDirection(PlayerDirection.Down)
                break
            case 'w':
                arenaRef.current.getPlayer(0)?.setDirection(PlayerDirection.Up)
                break
            case 's':
                arenaRef.current.getPlayer(0)?.setDirection(PlayerDirection.Down)
                break
        }
    }, [])

    const handleKeyUp = useCallback(({ key }: KeyboardEvent) => {
        /* TODO - Step 0
        Map the key so that you can reset the moving direction
        of the corresponding player.
        Be aware that the user could have already pressed the key
        corresponding to the opposite player direction
        */
        switch (key) {
            case 'ArrowUp':
                if (arenaRef.current.getPlayer(1)?.getDirection() === PlayerDirection.Up) {
                    arenaRef.current.getPlayer(1)?.setDirection(PlayerDirection.Hold)
                }
                break
            case 'ArrowDown':
                if (arenaRef.current.getPlayer(1)?.getDirection() === PlayerDirection.Down) {
                    arenaRef.current.getPlayer(1)?.setDirection(PlayerDirection.Hold)
                }
                break
            case 'w':
                if (arenaRef.current.getPlayer(0)?.getDirection() === PlayerDirection.Up) {
                    arenaRef.current.getPlayer(0)?.setDirection(PlayerDirection.Hold)
                }
                break
            case 's':
                if (arenaRef.current.getPlayer(0)?.getDirection() === PlayerDirection.Down) {
                    arenaRef.current.getPlayer(0)?.setDirection(PlayerDirection.Hold)
                }
                break
        }
    }, [])

    const handleAnimationEnd = useCallback(() => {
        console.log('Animation ended')
        setBallAnimation(null)
        window.requestAnimationFrame(
            () => arenaRef.current.setBallAnimationEnded(true)
        )
    }, [])

    useEffect(() => {
        if (isPlaying) {
            arenaRef.current.play()
        } else {
            arenaRef.current.pause()
        }
    }, [isPlaying])

    useEffect(() => {
        setBallAnimation(arenaRef.current.getBall().getAnimation())
        return () => {
            console.log('CLEANUP')
        }
    }, [])

    return {
        ballProps,
        playerPositions,
        handleKeyDown,
        handleKeyUp,
        handleAnimationEnd,
        score,
    }
}
