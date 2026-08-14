// EFI Calculator service worker — network-first with offline fallback.
// Online users always get the live deploy; the cache is only an offline net,
// so a deploy never strands returning visitors on a stale shell.
// All paths are relative so the site works from a subpath (…/efi-calculator/).
const CACHE = 'efi-v1';
const CORE = ['./', './index.html', './manifest.webmanifest'];
const ICONS = ['./icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    // Icons are non-essential: a missing one must not fail the install.
    await Promise.all(ICONS.map(url => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(name => (name === CACHE ? null : caches.delete(name))));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      // Offline: fall back to the last cached copy.
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const shell = await caches.match('./index.html', { ignoreSearch: true });
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
