require('dotenv').config()

const path = require('path')
const webpack = require('webpack')

const withOffline = require('next-offline')
const WebpackPwaManifest = require('webpack-pwa-manifest')

module.exports = withOffline({
    generateSw: true,
    workboxOpts: {
        swDest: 'static/service-worker.js',
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['.next/static/*', '.next/static/commons/*'],
        modifyUrlPrefix: { '.next': '/_next' },
        runtimeCaching: [
            {
                urlPattern: '/',
                handler: 'networkFirst',
                options: {
                    cacheName: 'html-cache',
                }
            },
            {
                urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif)/,
                handler: 'cacheFirst',
                options: {
                    cacheName: 'image-cache',
                    cacheableResponse: {
                        statuses: [0, 200],
                    }
                }
            }
        ]
    },

    webpack: (config) => {

        /** 
         * Environment variables exposed to the UI 
         */
        config.plugins.push(new webpack.EnvironmentPlugin([
            'MAGENTO_BACKEND_URL'
        ]));

        /**
         * PWA Manifest
         * https://www.npmjs.com/package/webpack-pwa-manifest
         */
        config.plugins.push(new WebpackPwaManifest({
            // inject: false,
            fingerprints: false,
            filename: 'static/manifest.webmanifest',
            name: 'Luma',
            short_name: 'Luma',
            description: 'With more than 230 stores spanning 43 states and growing, Luma is a nationally recognized active wear manufacturer and retailer. We’re passionate about active lifestyles – and it goes way beyond apparel.',
            background_color: '#ffffff',
            orientation: "portrait",
            display: "standalone",
            start_url: ".",
            publicPath: "../",
            icons: [
                {
                    src: path.resolve('./static/images/app-icon.png'),
                    sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
                    destination: path.join('static', 'icons'),
                },
                {
                    src: path.resolve('./static/images/app-icon-ios.png'),
                    sizes: [120, 152, 167, 180],
                    destination: path.join('static', 'icons'),
                    ios: true
                }
            ]


        }))

        return config
    }
})
