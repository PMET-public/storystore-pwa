require('dotenv').config()
const webpack = require('webpack')
const path = require('path')

const WebpackPwaManifest = require('webpack-pwa-manifest')
const withOffline = require('next-offline')
const workboxOpts = require('./workboxOpts')



module.exports = withOffline({
    workboxOpts,

    webpack: config => {
        /**
         * Luma PWA Variable
         */
        config.plugins.push(
            new webpack.DefinePlugin({
                LUMA_ENV: {
                    MAGENTO_URL: JSON.stringify(process.env.MAGENTO_URL),
                    CONTENT_HOME_PAGE_ID: Number(process.env.CONTENT_HOME_PAGE_ID),
                    CONTENT_PARENT_CATEGORIES_ID: Number(process.env.CONTENT_PARENT_CATEGORIES_ID),
                    CONTENT_FOOTER_BLOCK_ID: JSON.stringify(process.env.CONTENT_FOOTER_BLOCK_ID),
                    DEVELOPMENT: process.env.NODE_ENV !== 'production',
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
                theme_color: '#222222',
                orientation: 'portrait-primary',
                display: 'standalone',
                start_url: '.',
                publicPath: '/_next/',
                crossorigin: 'use-credentials',
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
