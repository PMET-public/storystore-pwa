require('dotenv').config()
const webpack = require('webpack')

const withTypescript = require('@zeit/next-typescript')

module.exports = withTypescript({
    webpack: config => {
        
        // Environment variables exposed to the UI 
        config.plugins.push(new webpack.EnvironmentPlugin([
            'NODE_ENV', 
            'MAGENTO_BACKEND_URL'
        ]))
        
        return config
    }
})
