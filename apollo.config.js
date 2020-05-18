const fs = require('fs')
const path = require('path')

const dotenvPath = path.resolve(__dirname + '/.env')
const { MAGENTO_URL } = require('dotenv').parse(fs.readFileSync(dotenvPath))

module.exports = {
    client: {
        service: {
            name: 'magento',
            url: new URL('graphql', MAGENTO_URL).href,
        },
        clientSchemaDirectives: ['client', 'rest'],
        includes: ['./graphql/**/*.graphql', './lib/apollo/**/*.ts', './components/**/graphql/**/*.graphql'],
    },
}
