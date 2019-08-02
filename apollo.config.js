const fs = require('fs')
const path = require('path')

const dotenvPath = path.resolve(__dirname + '/.env')
const { MAGENTO_GRAPHQL_URL } = require('dotenv').parse(fs.readFileSync(dotenvPath))

module.exports = {
        client: {
            service: {
                name: 'magento',
                url: MAGENTO_GRAPHQL_URL
            },
            clientSchemaDirectives: ['client', 'rest'],
            includes: [
                './components/**/*.tsx',
                './pages/**/*.tsx',
                './templates/**/*.tsx',
                './lib/apollo-link-state.ts',
            ]
        }
    }