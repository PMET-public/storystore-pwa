const DAY_IN_SECONDS = 86400

const cacheable = new workbox.cacheableResponse.CacheableResponse({
    statuses: [0, 200],
})

const fetchOptions = {
    credentials: 'same-origin',
}

workbox.core.skipWaiting()

workbox.core.clientsClaim()

workbox.precaching.precacheAndRoute(self.__precacheManifest || [], {
    cleanUrls: false,
})

workbox.precaching.cleanupOutdatedCaches()

/**
 * Routes
 */

// GraphQL API
workbox.routing.registerRoute(
    /\/api\/graphql/,
    new workbox.strategies.NetworkFirst({
        cacheName: 'api-graphql',
        fetchOptions,
        plugins: [
            cacheable,
            new workbox.expiration.Plugin({
                maxAgeSeconds: 7 * DAY_IN_SECONDS,
            }),
        ],
    })
)

// Images API
workbox.routing.registerRoute(
    /\/api\/images/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'api-images',
        fetchOptions,
        plugins: [
            cacheable,
            new workbox.expiration.Plugin({
                maxEntries: 100,
                maxAgeSeconds: 7 * DAY_IN_SECONDS,
            }),
        ],
    })
)

// Adobe Fonts (Typekit)
workbox.routing.registerRoute(
    /.*(?:typekit)\.net.*$/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'typekit',
        fetchOptions,
        plugins: [
            cacheable,
            new workbox.expiration.Plugin({
                maxAgeSeconds: 7 * DAY_IN_SECONDS,
            }),
        ],
    })
)

// Static resources
workbox.routing.registerRoute(
    /\/static\/(.*) /,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'static',
        fetchOptions,
        plugins: [
            cacheable,
            new workbox.expiration.Plugin({
                maxAgeSeconds: 7 * DAY_IN_SECONDS,
            }),
        ],
    })
)
