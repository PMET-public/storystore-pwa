require('dotenv').config()

const path = require('path')
const withOffline = require('next-offline')

module.exports = withOffline({
    poweredByHeader: false,

    // Build environment variables
    env: {
        GOOGLE_ANALYTICS: process.env.GOOGLE_ANALYTICS,
        CLOUD_MODE: process.env.CLOUD_MODE,
    },
    dontAutoRegisterSw: true,
    generateSw: false,
    workboxOpts: {
        swSrc: path.resolve(__dirname, './lib/workbox.ts'),
        swDest: 'static/service-worker.js',
    },

    async redirects() {
        return [
            {
                source: `/basic-auth`,
                destination: '/',
                permanent: false,
            },
        ]
    },

    async rewrites() {
        return [
            {
                source: `/service-worker.js`,
                destination: '/_next/static/service-worker.js',
            },
            /**
             * URlResolver
             */
            {
                source: '/:pathname*',
                destination: '/_url-resolver',
            },
        ]
    },

    async headers() {
        const headers = [
            { key: 'x-powered-by', value: 'Magento Commerce + StoryStore' },
            { key: 'x-powered-cloud', value: process.env.CLOUD_MODE ? 'true' : 'false' },
        ]

        if (!process.env.CLOUD_MODE) {
            headers.push({ key: 'Cache-Control', value: 's-maxage=1, stale-while-revalidate' })
        }

        return [
            { source: '/api/graphql', headers },
            { source: '/api/images', headers },
            { source: '/', headers },
            { source: '/search', headers },
            { source: '/cart', headers },
            { source: '/settings', headers },
            { source: '/offline', headers },
            { source: '/checkout', headers },
            { source: '/:pathname*', headers },
        ]
    },

    webpack: config => {
        /**
         * SVG Inline
         */
        config.module.rules.push({
            test: /\.svg$/,
            use: 'react-svg-loader',
        })

        /**
         * GraphQL Queries
         */
        config.module.rules.push({
            test: /\.(graphql|gql)$/,
            loader: 'graphql-tag/loader',
        })

        /**
         * Fix for missing 'fs' module not found
         * https://github.com/webpack-contrib/css-loader/issues/447
         */
        config.node = {
            fs: 'empty',
        }

        config.resolve.alias = {
            ...config.resolve.alias,
            '~': path.resolve(__dirname),
        }

        return config
    },
})
