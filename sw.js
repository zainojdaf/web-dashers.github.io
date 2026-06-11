const GHPATH = '/zainojdaf/web-dashers.github.io'; 
const CACHE_NAME = 'web-dashers-dynamic-v1';

// We cachen handmatig alleen de absolute basis om de app op te starten
const INITIAL_CORE = [
  `${GHPATH}/`,
  `${GHPATH}/index.html`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(INITIAL_CORE);
    })
  );
});

// DYNAMISCH CACHEN: Dit vangt ELK bestand op dat de game probeert te laden
self.addEventListener('fetch', (event) => {
  // Alleen GET-verzoeken cachen (bestanden, audio, scripts)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Als het bestand al in de cache staat, laad het direct (werkt offline!)
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Staat het er niet in? Haal het op van internet en sla het direct op voor de volgende keer
      return fetch(event.request).then((networkResponse) => {
        // Controleer of het verzoek geldig is
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Sla een kopie van het bestand op in de cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback als je volledig offline bent en het bestand niet in de cache staat
        return caches.match(`${GHPATH}/index.html`);
      });
    })
  );
});
