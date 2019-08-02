import fetch from 'isomorphic-unfetch'
import { ApolloClient, InMemoryCache, HttpLink } from 'apollo-boost'
import { defaults, typeDefs, resolvers } from './apollo-link-state'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'

declare var global: any
declare var window: any

const isBrowser = typeof window !== 'undefined'
export const uri = isBrowser ? '/graphql' : (process.env.MAGENTO_GRAPHQL_URL || '')

// Polyfill fetch() on the server (used by apollo-client)
if (!isBrowser) {
    global.fetch = fetch
}

export let apolloClient: any = null

function create(initialState: any) {

    const cache = new InMemoryCache().restore(initialState || {})

    // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
    const client = new ApolloClient({
        cache,
        ssrMode: !isBrowser, // Disables forceFetch on the server (so queries are only run once)
        connectToDevTools: isBrowser,
        link: ApolloLink.from([
            onError(({ graphQLErrors, networkError }) => {
                if (graphQLErrors) {
                    graphQLErrors.forEach(({ message, locations, path }) => {
                        console.info(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
                    })
                }

                if (networkError) console.info(`[Network error]: ${networkError}`)
            }),

            new HttpLink({ uri }),
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
    if (!isBrowser) return create(initialState)

    // Reuse client on the client-side
    if (!apolloClient) {
        apolloClient = create(initialState)
    }

    // Attach Apollo Client to the Dev Tools
    // https://github.com/apollographql/apollo-client-devtools#configuration
    window.__APOLLO_CLIENT__ = apolloClient

    return apolloClient
}
