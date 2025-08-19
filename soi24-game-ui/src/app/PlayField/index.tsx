import {
    PLAYFIELD_STYLE,
    PLAYFIELD_SVG_VIEWBOX,
    PLAYFIELD_SVG_WIDTH,
    PLAYFIELD_SVG_HEIGHT,
    SCOREBOARD_STYLE,
    LEFT_TEAM_COLOR,
    RIGHT_TEAM_COLOR,
} from '../utils/const'
import usePlayField from './hooks/usePlayField'
import PlayFieldPlayer from './PlayFieldPlayer'

export default function PlayField() {

    const {
        ballProps,
        playerPositions,
        handleKeyDown,
        handleKeyUp,
        handleAnimationEnd,
        score,
    } = usePlayField()

    return (
        <div style={PLAYFIELD_STYLE}>
            <div style={SCOREBOARD_STYLE}>
                <div style={{ color: LEFT_TEAM_COLOR }}>Score: {score.left}</div>
                <div style={{ color: RIGHT_TEAM_COLOR }}>Score: {score.right}</div>
            </div>
            <svg
                tabIndex={0}
                overflow='visible'
                viewBox={PLAYFIELD_SVG_VIEWBOX}
                width={PLAYFIELD_SVG_WIDTH}
                height={PLAYFIELD_SVG_HEIGHT}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            >
                <circle
                    {...ballProps}
                    onAnimationEnd={handleAnimationEnd}
                />
                {playerPositions.map((playerPos, idx) => (
                    <PlayFieldPlayer
                        key={idx}
                        player={playerPos}
                    />
                ))}
            </svg>
        </div>
    )
}
