const CACHE = 'binario-pwa-v1';
const scopeUrl = new URL(self.registration.scope);
const core = ['./', './index.html', './en/', './it/', './manifest.webmanifest',
  './pwa.js', './icons/icon-192.png', './icons/icon-512.png'];
const optional = [
  'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js',
  'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.core.js',
];
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(core.map((path) => new URL(path, scopeUrl).href));
    await Promise.allSettled(optional.map(async (url) => {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) await cache.put(url, response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('binario-pwa-') && name !== CACHE)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate' && url.origin === scopeUrl.origin &&
      url.pathname.startsWith(scopeUrl.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request);
        if (response.ok && !url.search) await cache.put(request, response.clone());
        return response;
      } catch {
        const relative = url.pathname.slice(scopeUrl.pathname.length);
        const fallback = relative === 'en' || relative.startsWith('en/') ? 'en/' :
          relative === 'it' || relative.startsWith('it/') ? 'it/' : '';
        return (await cache.match(request, { ignoreSearch: true })) ||
          (await cache.match(new URL(fallback, scopeUrl).href)) ||
          Response.error();
      }
    })());
    return;
  }
  const isLocal = url.origin === scopeUrl.origin && url.pathname.startsWith(scopeUrl.pathname);
  const isThree = url.origin === 'https://cdn.jsdelivr.net' &&
    url.pathname.startsWith('/npm/three@0.180.0/build/');
  if (!isLocal && !isThree) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
