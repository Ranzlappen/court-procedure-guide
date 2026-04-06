importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

if (workbox) {
  // Precache critical static assets
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '1' },
    { url: '/index.html', revision: '1' },
    { url: '/styles.css', revision: '1' },
    { url: '/app.js', revision: '1' },
    { url: '/manifest.json', revision: '1' },
    { url: '/icons/icon-192x192.png', revision: '1' },
    { url: '/icons/icon-512x512.png', revision: '1' }
  ]);

  // Network-first for HTML (navigations)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'html-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60
        })
      ]
    })
  );

  // Cache-first for CSS
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'style',
    new workbox.strategies.CacheFirst({
      cacheName: 'css-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60
        })
      ]
    })
  );

  // Cache-first for JS
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script',
    new workbox.strategies.CacheFirst({
      cacheName: 'js-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60
        })
      ]
    })
  );

  // Cache-first for images
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60
        })
      ]
    })
  );

  // Clean up old caches on activate
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !name.startsWith('workbox-'))
            .filter((name) => !['html-cache', 'css-cache', 'js-cache', 'image-cache'].includes(name))
            .map((name) => caches.delete(name))
        );
      })
    );
  });
} else {
  console.log('Workbox failed to load');
}
