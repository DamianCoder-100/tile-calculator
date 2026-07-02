const CACHE_NAME = "tile-calculator-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./main.js",
  "./save.js",
  "./manifest.json",
  "perry-logo2026.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});