# Analisi dei file TypeScript del progetto soi24-game-ui

Questo documento descrive la struttura e le funzionalità dei principali file `.ts` presenti nel progetto, spiegando come interagiscono tra loro per creare il gioco.

## 1. Core Logic (src/app/utils/)

### `Arena.ts`
**Funzione:** È il "motore" principale del gioco.
**Dettagli:**
- Gestisce il loop di gioco principale utilizzando `requestAnimationFrame`.
- Contiene le istanze di `Ball` e l'array di `Player`.
- Nel metodo `animate()`, coordina l'aggiornamento di tutti gli elementi: chiama `player.animate()` per ogni giocatore e `ball.animate()` per la palla.
**Collegamenti:**
- Importa `Ball` e `Player` per gestirli.
- Viene istanziato dentro `usePlayField.ts`.

### `Ball.ts`
**Funzione:** Gestisce la fisica e il comportamento della palla.
**Dettagli:**
- Calcola le traiettorie, le collisioni con i bordi del campo e con le racchette dei giocatori.
- Gestisce le animazioni speciali (es. esplosione al goal, coriandoli).
- Notifica i cambiamenti di stato tramite una callback `onChange`.
**Collegamenti:**
- Riceve l'array di `Player` nel metodo `animate` per verificare le collisioni.
- Utilizza costanti da `const.ts` per velocità e dimensioni.

### `Player.ts`
**Funzione:** Rappresenta un singolo giocatore (racchetta).
**Dettagli:**
- Mantiene lo stato della posizione (Y) e della direzione di movimento (`Up`, `Down`, `Hold`).
- Il metodo `animate()` aggiorna la posizione in base alla direzione corrente, rispettando i limiti del campo.
- Notifica l'aggiornamento della posizione tramite una callback `onChangePositionY`.
**Collegamenti:**
- Viene controllato da `Arena.ts`.
- Comunica direttamente con lo stato di React (tramite la callback passata dal costruttore) per aggiornare la UI.

### `const.ts`
**Funzione:** File di configurazione globale.
**Dettagli:**
- Contiene tutte le costanti "magiche" del gioco: dimensioni del campo (`PLAYFIELD_WIDTH`, `PLAYFIELD_HEIGHT`), velocità (`BALL_SPEED`, `PLAYER_SPEED`), dimensioni degli oggetti e FPS target.
**Collegamenti:**
- Importato da quasi tutti gli altri file (`Ball.ts`, `Player.ts`, `usePlayField.ts`) per garantire coerenza nei calcoli fisici e nel rendering.

### `interfaces.ts`
**Funzione:** Definizioni dei tipi TypeScript.
**Dettagli:**
- Definisce le interfacce e gli enum usati nel progetto, come `BallPosition`, `PlayerPosition`, `PlayerTeam`, `PlayerDirection`.
**Collegamenti:**
- Usato trasversalmente per garantire la tipizzazione forte e prevenire errori di passaggio dati tra i componenti.

## 2. React Integration (src/app/PlayField/hooks/)

### `usePlayField.ts`
**Funzione:** Custom Hook che fa da ponte tra la logica di gioco (classi JS) e l'interfaccia React.
**Dettagli:**
- Inizializza l'istanza di `Arena` dentro un `useRef` per mantenerla persistente.
- Gestisce lo stato locale di React (`useState`) per le posizioni dei giocatori e della palla, permettendo il rendering aggiornato.
- Gestisce gli input utente (tastiera) e li traduce in comandi per i giocatori (`setDirection`).
- Gestisce il punteggio (`score`) e la logica di goal.
**Collegamenti:**
- Importa e istanzia `Arena`, `Ball`, `Player`.
- Passa i setter di stato (`setPlayerLeftPosY`, ecc.) alle istanze delle classi logiche.

## 3. Configurazione App (src/app/ & src/environments/)

### `theme.ts`
**Funzione:** Configurazione del tema grafico.
**Dettagli:**
- Estende il tema di default (probabilmente MUI Joy o simile) definendo palette di colori e stili globali.

### `environment.ts`
**Funzione:** Configurazione dell'ambiente di sviluppo.
**Dettagli:**
- Esporta l'oggetto `environment` con flag come `production: false`. Usato per distinguere comportamenti tra sviluppo e produzione.
