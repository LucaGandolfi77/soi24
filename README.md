# 📚 Gestore PDF - Progressive Web App

Una Progressive Web App moderna e intuitiva per gestire documenti PDF con sezioni personalizzate, tema scuro e funzionalità offline.

## ✨ Caratteristiche

- 📄 **Caricamento PDF**: Carica uno o più file PDF tramite click o drag & drop
- 📑 **Sezioni Personalizzate**: Crea sezioni per organizzare i tuoi contenuti
- 📝 **Estrazione Testo**: Aggiungi testo estratto dai PDF alle tue sezioni
- 🖼️ **Gestione Immagini**: Inserisci immagini dai PDF nelle sezioni
- 🌙 **Tema Scuro**: Interfaccia elegante con tema scuro per proteggere gli occhi
- 💾 **Salvataggio Automatico**: Tutti i dati sono salvati localmente nel browser
- 📱 **Progressive Web App**: Installabile su dispositivi mobili e desktop
- 🔌 **Funzionalità Offline**: Continua a lavorare anche senza connessione internet
- 🇮🇹 **Lingua Italiana**: Interfaccia completamente in italiano

## 🚀 Come Iniziare

### Installazione

1. **Avvia un server locale**:
   
   Con Python:
   ```bash
   python3 -m http.server 8000
   ```
   
   Oppure con Node.js:
   ```bash
   npx serve
   ```

2. **Apri il browser**:
   Vai su `http://localhost:8000`

### Installazione come PWA

1. Apri l'applicazione nel browser
2. Clicca sul pulsante "Installa App" nell'header
3. Segui le istruzioni del browser per installare l'app sul tuo dispositivo

## 📖 Come Usare

### 1. Caricare PDF

- Clicca sull'area di upload o trascina i file PDF
- Supporta il caricamento di più file contemporaneamente
- I file vengono salvati localmente nel browser

### 2. Creare Sezioni

- Clicca su "➕ Aggiungi Sezione"
- Inserisci un titolo e una descrizione opzionale
- Le sezioni aiutano a organizzare i contenuti estratti dai PDF

### 3. Aggiungere Contenuto

- All'interno di ogni sezione, clicca "➕ Aggiungi Contenuto"
- Scegli il tipo di contenuto (Testo o Immagine)
- Seleziona il PDF sorgente
- Inserisci il contenuto:
  - **Testo**: Copia e incolla il testo estratto dal PDF
  - **Immagine**: Carica un'immagine salvata dal PDF

### 4. Gestire i Contenuti

- Elimina contenuti passando il mouse sopra e cliccando "✕"
- Elimina sezioni intere usando il pulsante 🗑️
- Elimina PDF caricati dalla sezione upload

## 🛠️ Struttura del Progetto

```
soi24/
├── index.html          # Pagina principale dell'applicazione
├── styles.css          # Stili con tema scuro
├── app.js             # Logica JavaScript principale
├── manifest.json      # Manifest PWA
├── service-worker.js  # Service Worker per funzionalità offline
├── icon-192.png       # Icona 192x192 per PWA
├── icon-512.png       # Icona 512x512 per PWA
└── README.md          # Questo file
```

## 🎨 Tecnologie Utilizzate

- **HTML5**: Struttura semantica
- **CSS3**: Stili moderni con variabili CSS e animazioni
- **JavaScript (Vanilla)**: Logica dell'applicazione
- **PDF.js**: Libreria per la gestione dei PDF (tramite CDN)
- **Service Workers**: Per funzionalità offline
- **LocalStorage**: Persistenza dei dati
- **Web App Manifest**: Configurazione PWA

## 💡 Funzionalità Future

- [ ] Estrazione automatica del testo dai PDF con OCR
- [ ] Esportazione delle sezioni in formato PDF
- [ ] Ricerca full-text nei contenuti
- [ ] Sincronizzazione cloud (opzionale)
- [ ] Annotazioni e evidenziazioni
- [ ] Condivisione sezioni
- [ ] Import/Export dei dati

## 🔒 Privacy

- Tutti i dati sono salvati **localmente** nel tuo browser
- Nessun dato viene inviato a server esterni
- I PDF rimangono sul tuo dispositivo
- Puoi cancellare tutti i dati in qualsiasi momento tramite le impostazioni del browser

## 📱 Compatibilità

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 🆘 Supporto

Per problemi o domande, contatta il supporto.

---

**Nota**: Per un'esperienza ottimale, utilizza l'applicazione su HTTPS o localhost per abilitare tutte le funzionalità PWA.