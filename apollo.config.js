const fs = require('fs')
const path = require('path')

const dotenvPath = path.resolve(__dirname + '/.env')
const { MAGENTO_URL } = require('dotenv').parse(fs.readFileSync(dotenvPath))
const MAGENTO_GRAPHQL_URL = new URL('graphql', MAGENTO_URL).href

module.exports = {
    client: {
        service: {
            name: 'magento',
            url: MAGENTO_GRAPHQL_URL,
        },
        clientSchemaDirectives: ['client', 'rest'],
        includes: [
            './apollo/**/*.ts',
            './components/**/graphql/**/*.graphql',
        ],
    },
}
