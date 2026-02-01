const CACHE_NAME = 'gestore-pdf-v1';
// Setta a true per disabilitare temporaneamente la logica di caching
// (utile in fase di sviluppo per vedere sempre gli HTML aggiornati)
const DISABLE_CACHING = true;
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  if (DISABLE_CACHING) {
    console.log('Service Worker: caching DISABLED for development. Skipping install caching.');
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, { mode: 'no-cors' });
        })).catch((err) => {
          console.log('Errore nel caching:', err);
          // Tentiamo di cachare almeno i file locali
          return cache.addAll([
            '/',
            '/index.html',
            '/styles.css',
            '/app.js',
            '/manifest.json'
          ]);
        });
      })
  );
  self.skipWaiting();
});

// Attivazione del Service Worker
self.addEventListener('activate', (event) => {
  if (DISABLE_CACHING) {
    console.log('Service Worker: caching DISABLED for development. Activating without cache cleanup.');
    event.waitUntil(self.clients.claim());
    return;
  }

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminazione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Gestione delle richieste
self.addEventListener('fetch', (event) => {
  if (DISABLE_CACHING) {
    // Bypass della cache: rispondi direttamente dalla rete (fallback su index.html se fallisce)
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se è in cache, restituiscilo
        if (response) {
          return response;
        }
        
        // Altrimenti, fai la richiesta di rete
        return fetch(event.request).then((response) => {
          // Verifica se la risposta è valida
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clona la risposta
          const responseToCache = response.clone();

          // Aggiungi alla cache
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Se la richiesta fallisce, prova a restituire una pagina offline
          return caches.match('/index.html');
        });
      })
  );
});

// Gestione messaggi per aggiornamento cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
