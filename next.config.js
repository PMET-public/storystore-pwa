require('dotenv').config()

const path = require('path')
const webpack = require('webpack')

const withOffline = require('next-offline')
const WebpackPwaManifest = require('webpack-pwa-manifest')

module.exports = withOffline({

    generateSw: false,
    workboxOpts: {
        swSrc: 'lib/service-worker.workbox.js',
        swDest: 'service-worker.js'
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
            filename: 'static/manifest.json',
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
                    src: path.resolve('./static/images/logo-icon.png'),
                    sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
                    destination: path.join('static', 'images')
                }
            ]


        }))

        return config
    }
})
