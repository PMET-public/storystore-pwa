const DAY_IN_SECONDS = 86400

const cacheable = new workbox.cacheableResponse.CacheableResponse({
    statuses: [0, 200],
})

const fetchOptions = {
    requestWillFetch: ({ request }) =>
        new Request(request, {
            credentials: 'same-origin',
            redirect: 'follow',
        }),
}

workbox.core.skipWaiting()

workbox.core.clientsClaim()

workbox.precaching.precacheAndRoute(self.__precacheManifest || [])

/**
 * Routes
 */

// All but APIs
workbox.routing.registerRoute(
    /^https?((?!\/api).)*$/,
    new workbox.strategies.NetworkFirst({
        cacheName: 'http-requests',
        plugins: [
            cacheable,
            fetchOptions,
            new workbox.expiration.Plugin({
                maxAgeSeconds: 30 * DAY_IN_SECONDS,
            }),
        ],
    })
)

// GraphQL API
workbox.routing.registerRoute(
    /\/api\/graphql/,
    new workbox.strategies.NetworkFirst({
        cacheName: 'api-graphql',
        plugins: [
            cacheable,
            fetchOptions,
            new workbox.expiration.Plugin({
                maxAgeSeconds: 30 * DAY_IN_SECONDS,
            }),
        ],
    })
)

// Images API
workbox.routing.registerRoute(
    /\/api\/images/,
    new workbox.strategies.CacheFirst({
        cacheName: 'api-images',
        plugins: [
            cacheable,
            fetchOptions,
            new workbox.expiration.Plugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * DAY_IN_SECONDS,
            }),
        ],
    })
)
