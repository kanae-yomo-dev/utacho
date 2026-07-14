// ネットワーク優先・キャッシュフォールバック方式。
// オンライン時は常に最新を取得し、圏外(カラオケボックス等)ではキャッシュで動く。
const CACHE = "utacho-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // 外部ドメイン(iTunes API等)には介入しない。介入するとオフラインfallbackが
  // index.html を返してしまい、外部リクエストが壊れる
  if (new URL(e.request.url).origin !== self.location.origin) return;
  // cache:"no-cache" でHTTPキャッシュ(GitHub Pagesはmax-age=600)を条件付き検証にし、
  // デプロイ後すぐ最新が届くようにする(未変更ならETagの304で転送は起きない)
  e.respondWith(
    fetch(new Request(e.request.url, { cache: "no-cache" }))
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() =>
        caches
          .match(e.request, { ignoreSearch: true })
          .then((r) => r || caches.match("./index.html"))
      )
  );
});
