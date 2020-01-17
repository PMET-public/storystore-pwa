require('dotenv').config();

const crypto = require('crypto');
const path = require('path');
const webpack = require('webpack');
const withOffline = require('next-offline');

const getRevisionHash = () => require('crypto').createHash('md5').update(Date.now().toString(), 'utf8').digest('hex');

module.exports = withOffline({
    transformManifest: (manifest) =>
        // Precaching
        [
            { url: '/', revision: getRevisionHash() },
            { url: '/search', revision: getRevisionHash() },
            { url: '/cart', revision: getRevisionHash() },
            { url: '/checkout', revision: getRevisionHash() },
            { url: '/robots.txt', revision: getRevisionHash() },
            { url: '/manifest.webmanifest', revision: getRevisionHash() }
        ].concat(manifest),
    dontAutoRegisterSw: true,
    generateSw: false,
    workboxOpts: {
        swSrc: path.resolve(__dirname, './lib/workboxOptions.js'),
        swDest: 'static/service-worker.js'
    },

    experimental: {
        async redirects() {
            return [
                {
                    source: `/basic-auth`,
                    destination: '/',
                    permanent: false,
                }
            ];
        },
        async rewrites() {
            return [
                {
                    source: `/service-worker.js`,
                    destination: '/_next/static/service-worker.js'
                }
            ];
        }
    },
    webpack: (config) => {
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
                    DEVELOPMENT: process.env.NODE_ENV !== 'production'
                }
            })
        );

		/**
         * SVG Inline
         */
        config.module.rules.push({
            test: /\.svg$/,
            use: 'react-svg-loader'
        });

		/**
         * GraphQL Queries
         */
        config.module.rules.push({
            test: /\.(graphql|gql)$/,
            exclude: /node_modules/,
            loader: 'graphql-tag/loader'
        });

		/**
         * Fix for missing 'fs' module not found
         * https://github.com/webpack-contrib/css-loader/issues/447
         */
        config.node = {
            fs: 'empty'
        };

        return config;
    }
});
