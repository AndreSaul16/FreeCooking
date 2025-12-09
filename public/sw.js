// Service Worker básico
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Estrategia básica: Network first, fallback to cache (si implementamos cache luego)
    // Por ahora, solo dejamos pasar las peticiones
    event.respondWith(fetch(event.request));
});
