import { registerRoute, setCatchHandler, setDefaultHandler } from 'workbox-routing'
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching'
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { skipWaiting, clientsClaim, WorkboxPlugin } from 'workbox-core'

const DAY_IN_SECONDS = 86400

const FALLBACK_HTML_URL = '/offline'

const fetchOptions: RequestInit = {
    credentials: 'include',
}

const plugins: WorkboxPlugin[] = [
    new CacheableResponsePlugin({
        statuses: [200],
    }),
    new ExpirationPlugin({
        maxAgeSeconds: 7 * DAY_IN_SECONDS,
    }),
]

const getRevisionHash = require('crypto').createHash('md5').update(Date.now().toString(), 'utf8').digest('hex')

clientsClaim()

skipWaiting()

precacheAndRoute(
    [
        ...(self as any).__WB_MANIFEST,

        // Precached routes
        { url: FALLBACK_HTML_URL, revision: getRevisionHash },
        // { url: '/', revision: getRevisionHash },
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

// Images API
registerRoute(
    /\/api\/images/,
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
    /\/static\//,
    new StaleWhileRevalidate({
        cacheName: 'static',
        fetchOptions,
        plugins,
    })
)

/**
 * Fallback (default handler)
 */

setDefaultHandler(args => {
    const { request } = args.event
    if (request.method === 'GET' && request.destination === 'document') {
        return new NetworkFirst({
            cacheName: 'default',
            fetchOptions,
            plugins,
        }).handle(args)
    } else {
        return fetch(request, fetchOptions)
    }
})

setCatchHandler(({ event }) => {
    if (event?.request.method === 'GET' && event?.request.destination === 'document') {
        return matchPrecache(FALLBACK_HTML_URL)
    } else {
        return Response.error() as any
    }
})
