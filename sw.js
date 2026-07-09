/* オフライン動作用 Service Worker
   初回アクセス時に全ファイルをキャッシュし、以後は通信なしで起動できる */
const CACHE_NAME = 'daihon-editor-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* キャッシュ優先: オフラインでも必ず表示できる */
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        /* 新しく取得できたものは次回のためにキャッシュへ */
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(()=>{});
        return res;
      }).catch(() => cached);
    })
  );
});
