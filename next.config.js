require('dotenv').config()
const webpack = require('webpack')
const path = require('path')

const withOffline = require('next-offline')
const WebpackPwaManifest = require('webpack-pwa-manifest')

const cacheExpiration = {
    maxAgeSeconds: 30 * 24 * 60 * 60,
    maxEntries: 200,
}

module.exports = withOffline({
    workboxOpts: {
        clientsClaim: true,
        skipWaiting: true,
        modifyURLPrefix: {
            'static/': '_next/static/',
            'public/': '_next/public/',
        },
        exclude: ['react-loadable-manifest.json', 'build-manifest.json'],
        inlineWorkboxRuntime: true,
        runtimeCaching: [
            {
                urlPattern: /^https?((?!\/graphql).)*$/, //all but GraphQL
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'offlineCache',
                    expiration: {
                        ...cacheExpiration,
                    },
                },
            },

            {
                urlPattern: '/',
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'html',
                    expiration: {
                        ...cacheExpiration,
                    },
                },
            },

            {
                urlPattern: /\/graphql/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'graphql',
                    expiration: {
                        ...cacheExpiration,
                    },
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
                LUMA_ENV: {
                    MAGENTO_URL: JSON.stringify(process.env.MAGENTO_URL),
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
