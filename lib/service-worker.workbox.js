workbox.setConfig({ debug: true });
workbox.skipWaiting();
workbox.clientsClaim();


workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg)$/,
    new workbox.strategies.CacheFirst({
        cacheName: 'images',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
    })
);

// Use a stale-while-revalidate strategy for all other requests.
workbox.routing.setDefaultHandler(
    new workbox.strategies.StaleWhileRevalidate()
);


workbox.precaching.precacheAndRoute(self.__precacheManifest || []);