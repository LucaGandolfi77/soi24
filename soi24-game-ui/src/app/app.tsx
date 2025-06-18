import '@fontsource/public-sans'
import { useState } from 'react'
import {
    CssVarsProvider,
    Stack,
    Typography,
    Box
} from '@mui/joy'
import theme from './theme'
import PlayField from './PlayField'
import { GameScore } from './utils/interfaces'

export default function App() {
    const [score, setScore] = useState<GameScore>({ left: 0, right: 0 })

    return (
        <CssVarsProvider theme={theme}>
            <Stack
                spacing={2}
                alignItems='center'
                justifyContent='center'
            >
                <Box 
                    display="flex" 
                    alignItems="center" 
                    gap={3}
                    flexWrap="wrap"
                    justifyContent="center"
                >
                    <Typography
                        noWrap
                        level='display1'
                        variant='soft'
                        color='primary'
                    >
                        SOI Game
                    </Typography>
                    <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={2}
                    >
                        <Typography 
                            level="h3" 
                            variant="outlined"
                            color="neutral"
                            sx={{ px: 2, py: 1, borderRadius: 'md' }}
                        >
                            Player 1: {score.left}
                        </Typography>
                        <Typography level="h4" color="neutral">-</Typography>
                        <Typography 
                            level="h3" 
                            variant="outlined" 
                            color="neutral"
                            sx={{ px: 2, py: 1, borderRadius: 'md' }}
                        >
                            Player 2: {score.right}
                        </Typography>
                    </Box>
                </Box>
                <Typography color="neutral" textAlign="center">
                    Premi INVIO per iniziare/fermare | W/S per Player 1 | ↑/↓ per Player 2 | R per reset punteggio
                </Typography>
                <PlayField onScoreChange={setScore} />
            </Stack>
        </CssVarsProvider>
    )
}