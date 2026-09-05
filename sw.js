const VERSION = "quantum-bunny-offline-v4";
const CORE_CACHE = `${VERSION}-core`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const BASE = new URL("./", self.registration.scope).pathname;
const asset = (path) => `${BASE}${path.replace(/^\/+/, "")}`;
const SHELL = [asset(""), asset("index.html"), asset("manifest.webmanifest"), asset("icons/quantum-bunny.svg"), asset("icons/icon-192.png"), asset("icons/icon-512.png")];
const POSTCARDS = ["chiikawa_home", "cthulhu_shoggoth", "dream_city", "earth_iceland", "earth_kyoto", "earth_maldives", "earth_petra", "earth_venice", "hachiware_cave", "innsmouth", "santorini", "scp096", "scp914", "scp_forest", "scp_site19_lounge", "space_blackhole", "space_comet", "space_neptune", "usagi_meadow", "yellow_king"].map((name) => asset(`postcards/${name}.png`));
const PRECACHE = [...SHELL, ...POSTCARDS];

const isCacheable = (response) => response && response.ok && response.type !== "opaque";
const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin;
const notify = async (source, type, detail = {}) => {
  if (source && "postMessage" in source) source.postMessage({ type, ...detail });
  else (await self.clients.matchAll({ type: "window", includeUncontrolled: true })).forEach((client) => client.postMessage({ type, ...detail }));
};

async function cacheUrls(urls, cacheName = RUNTIME_CACHE) {
  const cache = await caches.open(cacheName);
  const uniqueUrls = [...new Set(urls)];
  const results = await Promise.allSettled(uniqueUrls.map(async (url) => {
    const request = new Request(url, { cache: "reload" });
    const response = await fetch(request);
    if (isCacheable(response)) await cache.put(request, response);
  }));
  return results.filter((result) => result.status === "fulfilled").length;
}

self.addEventListener("install", (event) => event.waitUntil((async () => {
  await cacheUrls(PRECACHE, CORE_CACHE);
  await self.skipWaiting();
})()));

self.addEventListener("activate", (event) => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)));
  await self.clients.claim();
  await notify(null, "OFFLINE_READY", { version: VERSION });
})()));

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS" || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.filter((url) => typeof url === "string" && new URL(url, self.location.origin).origin === self.location.origin);
  event.waitUntil(cacheUrls(urls).then((cached) => notify(event.source, "OFFLINE_READY", { version: VERSION, cached })));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !isSameOrigin(request)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (isCacheable(response)) (await caches.open(RUNTIME_CACHE)).put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(asset("index.html"))) || (await caches.match(asset(""))) || Response.error();
      }
    })());
    return;
  }

  const destination = request.destination;
  if (["image", "style", "script", "font"].includes(destination) || request.url.includes("/assets/")) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (isCacheable(response)) (await caches.open(RUNTIME_CACHE)).put(request, response.clone());
        return response;
      } catch {
        return new Response("", { status: 504, statusText: "Offline asset unavailable" });
      }
    })());
  }
});
