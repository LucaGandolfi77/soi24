# 📚 Gestore PDF - Progressive Web App

Una Progressive Web App moderna e intuitiva per gestire documenti PDF con sezioni personalizzate, tema scuro e funzionalità offline.

## ✨ Caratteristiche

- � **Caricamento Automatico PDF**: Le sezioni vengono create automaticamente per ogni PDF presente nella cartella `/pdf`
- 📑 **Sezioni per PDF**: Ogni PDF ha la sua sezione dedicata
- 📝 **Estrazione Testo**: Aggiungi testo estratto dai PDF alle rispettive sezioni
- 🖼️ **Gestione Immagini**: Inserisci immagini dai PDF nelle sezioni
- 🌙 **Tema Scuro**: Interfaccia elegante con tema scuro per proteggere gli occhi
- 💾 **Salvataggio Automatico**: Tutti i contenuti sono salvati localmente nel browser
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

### 1. Preparare i PDF

- Posiziona i tuoi file PDF nella cartella `/pdf`
- L'applicazione creerà automaticamente una sezione per ogni PDF

### 2. Visualizzare le Sezioni

- Ogni PDF nella cartella `/pdf` avrà automaticamente una sezione dedicata
- Le sezioni mostrano il nome del file PDF come riferimento

### 3. Aggiungere Contenuto

- All'interno di ogni sezione, clicca "➕ Aggiungi Contenuto"
- Scegli il tipo di contenuto (Testo o Immagine)
- Inserisci il contenuto:
  - **Testo**: Copia e incolla il testo estratto dal PDF
  - **Immagine**: Carica un'immagine salvata dal PDF (screenshot o estrazione)

### 4. Gestire i Contenuti

- Elimina contenuti passando il mouse sopra e cliccando "✕"
- Tutti i contenuti sono tracciati con la fonte (nome del PDF)

## 🛠️ Struttura del Progetto

```
soi24/
├── pdf/                # Cartella contenente i file PDF
│   ├── SOI25-01-containers.pdf
│   ├── SOI25-02-webapps.pdf
│   └── SOI25-03-cloud.pdf
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
- [ ] Visualizzazione dei PDF direttamente nell'app
- [ ] Esportazione delle sezioni in formato PDF o Markdown
- [ ] Ricerca full-text nei contenuti
- [ ] Annotazioni e evidenziazioni
- [ ] Condivisione sezioni
- [ ] Import/Export dei dati
- [ ] Supporto per più cartelle di PDF

## 🔒 Privacy

- Tutti i contenuti sono salvati **localmente** nel tuo browser
- Nessun dato viene inviato a server esterni
- I PDF rimangono nella cartella `/pdf` sul tuo dispositivo
- Puoi cancellare i contenuti salvati in qualsiasi momento tramite le impostazioni del browser
- I file PDF non vengono caricati nel browser, solo i contenuti che aggiungi manualmente

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