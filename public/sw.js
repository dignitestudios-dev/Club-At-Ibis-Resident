/* Club At Ibis — service worker.
 * - Makes the portal installable.
 * - Offline: page navigations fall back to the last copy of that page (or the app shell), so the app
 *   still renders behind the in-app "You are offline" overlay instead of a separate offline screen.
 * - Hashed build assets (/_next/static) are cached so the cached page can actually boot offline.
 * API calls are never cached, so residents never see stale request data. */
const VERSION = "v2";
const PAGES = `cai-pages-${VERSION}`;
const STATIC = `cai-static-${VERSION}`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== PAGES && k !== STATIC).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  )
);

// Lets the app drop cached pages on sign-out (they can contain the resident's data).
self.addEventListener("message", (event) => {
  if (event.data === "clear-pages") event.waitUntil(caches.delete(PAGES));
});

const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline · Club At Ibis</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d1522;color:#f3efe3;font-family:system-ui,sans-serif;text-align:center;padding:24px}h1{font-size:1.25rem;margin:0 0 .5rem}p{margin:0 0 1.25rem;color:#9fb0c3;font-size:.9rem}button{background:#a58a47;color:#0d1522;border:0;border-radius:10px;padding:.7rem 1.4rem;font-weight:600;font-size:.95rem}</style></head><body><div><h1>You're offline</h1><p>Check your connection, then try again.</p><button onclick="location.reload()">Retry</button></div></body></html>`;

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network first, remember the page, fall back to the cached copy when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res.ok && res.type === "basic" && !res.redirected) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(request, copy));
          }
          return res;
        } catch {
          const cache = await caches.open(PAGES);
          const cached =
            (await cache.match(request)) ||
            (await cache.match("/dashboard")) ||
            (await cache.match("/")) ||
            (await cache.match((await cache.keys())[0] || "/__none__"));
          return (
            cached ||
            new Response(OFFLINE_HTML, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } })
          );
        }
      })()
    );
    return;
  }

  // Hashed build assets never change for a given URL: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
  }
});
