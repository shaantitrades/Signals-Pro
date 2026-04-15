// Market Signals24 — Service Worker (PWA offline + caching)
// INCREMENT THIS NUMBER ON EVERY DEPLOY to bust the cache
const CACHE_NAME = 'signals24-v20260416-2';

const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/logo.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// Install — pre-cache only non-HTML static assets, activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((url) =>
        fetch(url, { cache: 'no-cache' }).then((r) => r.ok ? cache.put(url, r) : null).catch(() => null)
      ))
    )
  );
  // Take over immediately — don't wait for old SW clients to close
  self.skipWaiting();
});

// Activate — delete ALL old caches, claim clients → new SW serves immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Message — allow page to trigger skipWaiting for immediate update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch strategy:
//   • HTML navigation  → network-first (always get latest page)
//   • Hashed JS/CSS    → cache-first   (Next.js hashes guarantee freshness)
//   • API              → network-only
//   • Other static     → stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // HTML navigation → network-first so updates are always seen
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Hashed Next.js bundles (_next/static/) → cache-first (immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Other static assets → stale-while-revalidate
  if (url.pathname.match(/\.(png|svg|ico|woff2?|jpg|webp|gif)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }
});
