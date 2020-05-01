require('dotenv').config()

const path = require('path')
const withOffline = require('next-offline')

module.exports = withOffline({
    // Build environment variables
    env: {
        MAGENTO_URL: process.env.MAGENTO_URL,
        HOME_PAGE_ID: process.env.HOME_PAGE_ID,
        FOOTER_BLOCK_ID: process.env.FOOTER_BLOCK_ID,
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    },

    dontAutoRegisterSw: true,
    generateSw: false,
    workboxOpts: {
        swSrc: path.resolve(__dirname, './lib/workbox.ts'),
        swDest: 'static/service-worker.js',
    },

    experimental: {
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
            ]
        },
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
