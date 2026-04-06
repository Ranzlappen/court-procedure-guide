# CLAUDE.md — PWA Maintenance Rules

## PWA Architecture

This project is a Progressive Web App (PWA). The following files are critical and must not be removed or broken:

- `manifest.json` — Web app manifest (name, icons, display mode, colors)
- `service-worker.js` — Workbox-based service worker (caching strategies)
- `install-prompt.js` — Automatic native install prompt handler
- `icons/icon-192x192.png` and `icons/icon-512x512.png` — App icons

## Rules

1. **Never remove** the `<link rel="manifest">`, `<meta name="theme-color">`, or Apple mobile web app meta tags from `index.html`.
2. **Never remove** the service worker registration script at the bottom of `index.html`.
3. **Never remove** the `install-prompt.js` script tag from `index.html`.
4. If you add new static assets (CSS, JS, images), add them to the `precacheAndRoute` array in `service-worker.js` and increment the revision number.
5. When updating cached files, bump the `revision` value in `service-worker.js` to bust the precache.
6. The service worker scope is `/` — do not change the registration path.
7. Keep `start_url` as `/` in `manifest.json`.
8. Icon files in `icons/` are placeholders — replace with real branded icons but keep the filenames and sizes.
9. Do not modify existing HTML structure, CSS, or JS logic unless strictly necessary for the change being made.
