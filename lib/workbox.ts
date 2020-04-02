import { registerRoute, setCatchHandler } from 'workbox-routing'
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching'
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { skipWaiting, clientsClaim, WorkboxPlugin } from 'workbox-core'

const DAY_IN_SECONDS = 86400

const fetchOptions: RequestInit = {
    credentials: 'include',
}

const plugins: WorkboxPlugin[] = [
    new CacheableResponsePlugin({
        statuses: [0, 200],
    }),
    new ExpirationPlugin({
        maxAgeSeconds: 7 * DAY_IN_SECONDS,
    }),
]

clientsClaim()

skipWaiting()

precacheAndRoute((self as any).__WB_MANIFEST || [])

cleanupOutdatedCaches()

const getRoutePaths = (paths: string[]) => {
    return new RegExp('(' + paths.map(path => new URL(path, self.location.href).href).join('|') + ')')
}
/**
 * Routes
 */

//  Pages

registerRoute(
    new URL('/', self.location.href).href,
    new NetworkFirst({
        cacheName: 'pages',
        fetchOptions,
        plugins,
    }),
    'GET'
)

registerRoute(
    getRoutePaths(['/search', '/cart', '/checkout', '/offline']),
    new NetworkFirst({
        cacheName: 'pages',
        fetchOptions,
        plugins,
    }),
    'GET'
)

// Images API
registerRoute(
    getRoutePaths(['/api/images']),
    new CacheFirst({
        cacheName: 'api-images',
        fetchOptions,
        plugins,
    }),
    'GET'
)

// Adobe Fonts (Typekit)
registerRoute(
    /.*(?:typekit)\.net.*$/,
    new StaleWhileRevalidate({
        cacheName: 'typekit',
        plugins,
    }),
    'GET'
)

// Static resources
registerRoute(
    getRoutePaths(['/static']),
    new StaleWhileRevalidate({
        cacheName: 'static',
        fetchOptions,
        plugins,
    }),
    'GET'
)

registerRoute(
    getRoutePaths(['/robots.txt', '/manifest.webmanifest']),
    new StaleWhileRevalidate({
        cacheName: 'static',
        fetchOptions,
        plugins,
    }),
    'GET'
)

setCatchHandler(({ event }) => {
    switch (event.request.destination) {
        case 'document':
            // If using precached URLs:
            return matchPrecache('/offline')

        default:
            // If we don't have a fallback, just return an error response.
            return Response.error() as any
    }
})
