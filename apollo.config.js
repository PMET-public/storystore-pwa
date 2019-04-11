require('dotenv').config()

const graphQLUrl = new URL('graphql', `${process.env.MAGENTO_BACKEND_URL}`).href

module.exports = {
    graphQLUrl,
    client: {
        service: {
            name: 'magento',
            url: graphQLUrl
        },
        clientSchemaDirectives: ['client', 'rest'],
        includes: [
            './components/**/*.tsx',
            './containers/**/*.tsx',
            './lib/apollo-link-state.ts'
        ]
    }
}