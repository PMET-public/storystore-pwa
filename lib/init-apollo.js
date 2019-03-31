import { ApolloClient, InMemoryCache, HttpLink } from 'apollo-boost'
import fetch from 'isomorphic-unfetch'
import { defaultState, resolvers, typeDefs } from './local-resolvers'


let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
    global.fetch = fetch
}

function create(initialState) {
    const uri = new URL('graphql', process.env.MAGENTO_BACKEND_URL).href

    const cache = new InMemoryCache().restore(initialState || {})

    // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
    const client = new ApolloClient({
        cache,
        connectToDevTools: process.browser,
        ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
        link: new HttpLink({
            uri,// Server URL (must be absolute)
            credentials: 'Access-Control-Allow-Origin' // Additional fetch() options like `credentials` or `headers`
        }),
        typeDefs,
        resolvers
    })

    // Load initial local data in cache
    cache.writeData({ data: { ...defaultState } })
    client.onResetStore(() => cache.writeData({ data: defaultState }));

    return client
}

export default function initApollo(initialState) {
    // Make sure to create a new client for every server-side request so that data
    // isn't shared between connections (which would be bad)
    if (!process.browser) {
        return create(initialState)
    }

    // Reuse client on the client-side
    if (!apolloClient) {
        apolloClient = create(initialState)
    }

    return apolloClient
}