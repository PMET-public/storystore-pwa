const runtimeDefaultCacheOptions = {
    cacheableResponse: {
        statuses: [0, 200],
    },
    expiration: {
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 200,
    },
    fetchOptions: {
        credentials: 'same-origin',
    },
}

const workboxOpts = {
    clientsClaim: true,
    skipWaiting: true,

    runtimeCaching: [
        {
            urlPattern: /^https?((?!\/graphql).)*$/, //all but GraphQL
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'offlineCache',
                ...runtimeDefaultCacheOptions,
            },
        },

        {
            urlPattern: /\/graphql/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'graphql',
                ...runtimeDefaultCacheOptions,
            },
        },
    ],
}

module.exports = workboxOpts
