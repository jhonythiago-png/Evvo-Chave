// Chave — Service Worker (Fase 0: shell mínimo instalável)
// Cache-first para o shell estático; dados (Supabase) sempre vêm da rede.

const CACHE_NAME = 'chave-shell-v1';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nunca cachear chamadas ao Supabase — sempre buscar dados frescos da rede
  if (url.hostname.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
