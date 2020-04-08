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

const getRevisionHash = require('crypto').createHash('md5').update(Date.now().toString(), 'utf8').digest('hex')

const plugins: WorkboxPlugin[] = [
    new CacheableResponsePlugin({
        statuses: [0, 200],
    }),
    new ExpirationPlugin({
        maxAgeSeconds: 7 * DAY_IN_SECONDS,
    }),
]

const matchPaths = (paths: string[]) => new RegExp(paths.map(path => new URL(path, self.location.href).href).join('|'))

clientsClaim()

skipWaiting()

precacheAndRoute(
    [
        // Precached routes
        { url: FALLBACK_HTML_URL, revision: getRevisionHash },
        ...(self as any).__WB_MANIFEST,
    ] || []
)

cleanupOutdatedCaches()

/**
 * Routes
 */

// Images API
registerRoute(
    matchPaths(['/api/images']),
    new CacheFirst({
        cacheName: 'api-images',
        fetchOptions,
        plugins,
    })
)

// Static resources
registerRoute(
    matchPaths(['/static', '/robots.txt', '/manifest.webmanifest']),
    new StaleWhileRevalidate({
        cacheName: 'static',
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

/**
 * Fallback (default handler)
 */
setDefaultHandler(args => {
    const { request } = args.event

    const belongsToWebApp = new URL(request.url).host === self.location.host

    if (belongsToWebApp && request.method === 'GET' && request.destination === 'document') {
        return new NetworkFirst({
            cacheName: 'pages',
            fetchOptions,
            plugins,
        }).handle(args)
    }

    return fetch(request)
})

setCatchHandler(({ event }) => {
    const belongsToWebApp = !!event && new URL(event.request.url).host === self.location.host

    if (belongsToWebApp && event?.request.method === 'GET' && event?.request.destination === 'document') {
        return matchPrecache(FALLBACK_HTML_URL)
    }

    return Response.error() as any
})
