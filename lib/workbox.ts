import { registerRoute } from 'workbox-routing'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { skipWaiting, clientsClaim } from 'workbox-core'

const DAY_IN_SECONDS = 86400

const getRevisionHash = require('crypto')
    .createHash('md5')
    .update(Date.now().toString(), 'utf8')
    .digest('hex')

clientsClaim()

skipWaiting()

precacheAndRoute(
    [
        ...(self as any).__WB_MANIFEST,

        // Precached routes
        { url: '/', revision: getRevisionHash },
        { url: '/search', revision: getRevisionHash },
        { url: '/cart', revision: getRevisionHash },
        { url: '/checkout', revision: getRevisionHash },
        { url: '/robots.txt', revision: getRevisionHash },
        { url: '/manifest.webmanifest', revision: getRevisionHash },
    ] || []
)

cleanupOutdatedCaches()

/**
 * Routes
 */

// GraphQL API
registerRoute(
    /\/api\/graphql/,
    new NetworkFirst({
        cacheName: 'api-graphql',
        fetchOptions: {
            credentials: 'same-origin',
        },
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * DAY_IN_SECONDS,
            }),
        ],
    })
)

// Images API
registerRoute(
    /\/api\/images/,
    new CacheFirst({
        cacheName: 'api-images',
        fetchOptions: {
            credentials: 'same-origin',
        },
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 7 * DAY_IN_SECONDS,
            }),
        ],
    })
)

// Adobe Fonts (Typekit)
registerRoute(
    /.*(?:typekit)\.net.*$/,
    new StaleWhileRevalidate({
        cacheName: 'typekit',
        fetchOptions: {
            credentials: 'same-origin',
        },
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * DAY_IN_SECONDS,
            }),
        ],
    })
)

// Static resources
registerRoute(
    /\/static\//,
    new StaleWhileRevalidate({
        cacheName: 'static',
        fetchOptions: {
            credentials: 'same-origin',
        },
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * DAY_IN_SECONDS,
            }),
        ],
    })
)
