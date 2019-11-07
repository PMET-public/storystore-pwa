require('dotenv').config()
const webpack = require('webpack')
const path = require('path')

const withOffline = require('next-offline')
const WebpackPwaManifest = require('webpack-pwa-manifest')

const thirtyDays = 30 * 24 * 60 * 60

module.exports = withOffline({
    generateSw: true,
    generateInDevMode: true,
    workboxOpts: {
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
            {
                urlPattern: '/',
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'home',

                }
            },
            {
                urlPattern: '/\/.\\.js$/',
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'js',
                    expiration: {
                        maxEntries: 200,
                        maxAgeSeconds: thirtyDays
                    }
                }
            },
            {
                urlPattern: /graphql\/.*/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'graphql',
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                    expiration: {
                        maxAgeSeconds: thirtyDays
                    }
                }
            },
            {
                urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif)/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'images',
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                    expiration: {
                        maxEntries: 60,
                        maxAgeSeconds: thirtyDays
                    }
                },
            },
        ],
    },

    webpack: config => {
        /**
         * Luma PWA Variable
         */
        config.plugins.push(
            new webpack.DefinePlugin({
                'LUMA_ENV': {
                    HOME_PAGE_ID: Number(process.env.HOME_PAGE_ID),
                    PARENT_CATEGORIES_ID: Number(process.env.PARENT_CATEGORIES_ID),
                    FOOTER_BLOCK_ID: JSON.stringify(process.env.FOOTER_BLOCK_ID),
                },
            })
        )

        /**
         * PWA Manifest
         * https://www.npmjs.com/package/webpack-pwa-manifest
         */
        config.plugins.push(
            new WebpackPwaManifest({
                fingerprints: false,
                filename: 'manifest.webmanifest',
                name: 'Luma',
                short_name: 'Luma',
                description: 'We’re passionate about active lifestyles – and it goes way beyond apparel.',
                background_color: '#ffffff',
                theme_color: '#a14a24',
                orientation: 'landscape-primary',
                display: 'standalone',
                start_url: '.',
                publicPath: '/_next/',
                icons: [
                    {
                        src: path.resolve('./public/app-icon.png'),
                        sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
                        destination: 'static/icons',
                    },
                    {
                        src: path.resolve('./public/app-icon-ios.png'),
                        sizes: [120, 152, 167, 180],
                        destination: 'static/icons',
                        ios: true,
                    },
                ],
            })
        )

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
            exclude: /node_modules/,
            loader: 'graphql-tag/loader',
        })

        /**
         * Fix for missing 'fs' module not found
         * https://github.com/webpack-contrib/css-loader/issues/447
         */
        config.node = {
            fs: 'empty',
        }

        return config
    },
})
