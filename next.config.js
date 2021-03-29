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
             * Proxy GraphQL
             */
            {
                source: '/graphql',
                destination: '/api/graphql',
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
