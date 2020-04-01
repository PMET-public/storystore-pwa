import { registerRoute, setCatchHandler, setDefaultHandler } from 'workbox-routing'
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
    new RegExp(new URL('/', self.location.href).href + '$'), // home page
    new StaleWhileRevalidate({
        cacheName: 'pages',
        fetchOptions,
        plugins,
    })
)

registerRoute(
    getRoutePaths(['/search', '/cart', '/checkout', '/offline']), // other pages
    new StaleWhileRevalidate({
        cacheName: 'pages',
        fetchOptions,
        plugins,
    })
)

// Images API
registerRoute(
    getRoutePaths(['/api/images']),
    new CacheFirst({
        cacheName: 'api-images',
        fetchOptions,
        plugins,
    })
)

// Adobe Fonts (Typekit)
registerRoute(
    /.*(?:typekit)\.net.*$/,
    new StaleWhileRevalidate({
        cacheName: 'typekit',
        plugins,
    })
)

// Static resources
registerRoute(
    getRoutePaths(['/static']),
    new StaleWhileRevalidate({
        cacheName: 'static',
        fetchOptions,
        plugins,
    })
)

registerRoute(
    getRoutePaths(['/robots.txt', 'manifest.webmanifest']),
    new StaleWhileRevalidate({
        cacheName: 'pages',
        fetchOptions,
        plugins,
    })
)

/**
 * Fallback (default handler)
 */

setDefaultHandler(args => {
    const { request } = args.event


 
    if (
        request.method === 'GET' &&
        request.destination === 'document' &&
    ) {
        return new NetworkFirst({
            cacheName: 'default',
            fetchOptions,
            plugins,
        }).handle(args)
    }
    return fetch(request, fetchOptions)
})

setCatchHandler(({ event }) => {
    if (event?.request.method === 'GET' && event?.request.destination === 'document') {
        return matchPrecache('/offline')
    } else {
        return Response.error() as any
    }
})
