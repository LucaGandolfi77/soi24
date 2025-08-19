import {
    PLAYFIELD_STYLE,
    PLAYFIELD_SVG_VIEWBOX,
    PLAYFIELD_SVG_WIDTH,
    PLAYFIELD_SVG_HEIGHT,
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
    } = usePlayField()

    return (
        <div style={PLAYFIELD_STYLE}>
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
