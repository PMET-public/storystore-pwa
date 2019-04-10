import fetch from 'isomorphic-unfetch'
import { ApolloClient, InMemoryCache, HttpLink } from 'apollo-boost'
import { defaults, typeDefs, resolvers } from './apollo-link-state'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'

declare const process: any
declare const global: any
declare const window: any

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
    global.fetch = fetch
}

// Magento GraphQL endpoint
const uri = new URL('graphql', process.env.MAGENTO_BACKEND_URL).href

let apolloClient: any = null

function create(initialState: any) {

    const cache = new InMemoryCache().restore(initialState || {})

    // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
    const client = new ApolloClient({
        cache,
        ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
        connectToDevTools: process.browser,
        link: ApolloLink.from([
            onError(({ graphQLErrors, networkError }) => {
                if (graphQLErrors)
                    graphQLErrors.map(({ message, locations, path }) =>
                        console.log(
                            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                        ),
                    )

                if (networkError) console.log(`[Network error]: ${networkError}`)
            }),

            new HttpLink({
                uri,
                fetchOptions: {
                    mode: 'no-cors',
                }
            })
        ]),
        typeDefs,
        resolvers,
    })

    cache.writeData({ data: { ...defaults } })

    return client
}

export default function initApollo(initialState?: any) {
    // Make sure to create a new client for every server-side request so that data
    // isn't shared between connections (which would be bad)
    if (!process.browser) return create(initialState)

    // Reuse client on the client-side
    if (!apolloClient) {
        apolloClient = create(initialState)
    }

    // Attach Apollo Client to the Dev Tools
    // https://github.com/apollographql/apollo-client-devtools#configuration
    window.__APOLLO_CLIENT__ = apolloClient

    return apolloClient
}
