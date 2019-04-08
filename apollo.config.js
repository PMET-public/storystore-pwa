// const config = require('dotenv').config()
require("dotenv").config({ path: './.env' })

const url = new URL('graphql', process.env.MAGENTO_BACKEND_URL).href

module.exports = {
    client: {
        service: {
            name: 'magento',
            url
        },
        clientSchemaDirectives: ['client', 'rest'],
        includes: [
            './components/**/*.js',
            './lib/apollo-link-state.js'
        ]
    }
}