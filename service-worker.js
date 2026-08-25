importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

if (workbox) {
  // Precache critical static assets
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '5' },
    { url: '/index.html', revision: '5' },
    { url: '/css/variables.css', revision: '4' },
    { url: '/css/base.css', revision: '5' },
    { url: '/css/topbar.css', revision: '4' },
    { url: '/css/content.css', revision: '4' },
    { url: '/css/typography.css', revision: '4' },
    { url: '/css/flowchart.css', revision: '4' },
    { url: '/css/sidebar-panels.css', revision: '5' },
    { url: '/css/responsive.css', revision: '5' },
    { url: '/js/glossary-data.js', revision: '2' },
    { url: '/js/core.js', revision: '4' },
    { url: '/js/glossary-ui.js', revision: '3' },
    { url: '/js/controls.js', revision: '3' },
    { url: '/js/search.js', revision: '3' },
    { url: '/js/sidebar.js', revision: '3' },
    { url: '/js/storage.js', revision: '3' },
    { url: '/js/flowchart.js', revision: '3' },
    { url: '/manifest.json', revision: '3' },
    { url: '/icons/favicon.ico', revision: '5' },
    { url: '/icons/favicon-16x16.png', revision: '5' },
    { url: '/icons/favicon-32x32.png', revision: '5' },
    { url: '/icons/apple-touch-icon.png', revision: '6' },
    { url: '/icons/icon-192.png', revision: '5' },
    { url: '/icons/icon-512.png', revision: '5' },
    { url: '/icons/icon-maskable-192.png', revision: '6' },
    { url: '/icons/icon-maskable-512.png', revision: '6' }
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
