import { useMemo } from 'react'
import {
    LEFT_TEAM_X,
    PLAYER_BASE_SVG_PROPS,
    PLAYER_HEIGHT,
    PLAYER_WIDTH,
    RIGHT_TEAM_X,
} from '../../utils/const'
import { PlayerPosition, PlayerTeam } from '../../utils/interfaces'

export default function PlayFieldPlayer({
    player
}: {
    player: PlayerPosition
}) {
    const {
        team,
        y: posY,
    } = player

    const playerSvgProps: React.SVGProps<SVGRectElement> = useMemo(() => {
        const posX = team === PlayerTeam.LEFT
            ? LEFT_TEAM_X
            : RIGHT_TEAM_X

        return {
            ...PLAYER_BASE_SVG_PROPS,
            x: posX - PLAYER_WIDTH / 2,
            y: posY - PLAYER_HEIGHT / 2,
        }
    }, [team, posY])

    return (
        <rect
            {...playerSvgProps}
        />
    )
}
