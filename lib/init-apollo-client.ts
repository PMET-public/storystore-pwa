import { HttpLink } from 'apollo-link-http'
// import { getMainDefinition } from 'apollo-utilities'
// import { OperationDefinitionNode } from 'graphql'
import fetch from 'node-fetch'
import { ApolloLink } from 'apollo-link'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { onError } from 'apollo-link-error'
import { defaults, typeDefs, resolvers } from './apollo-link-state'

const isBrowser = typeof window !== 'undefined'

let apolloClient: any

// Polyfill fetch() on the server (used by apollo-client)
if (!isBrowser) {
    ;(global as any).fetch = fetch
}

export const graphQlUri = isBrowser ? '/graphql' : process.env.MAGENTO_GRAPHQL_URL || ''

function create(initialState: any) {
    const httpLink = new HttpLink({
        uri: graphQlUri,
        // useGETForQueries: true,
    })

    const link = ApolloLink.from([
        onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors) {
                graphQLErrors.forEach(({ message, locations, path }) => {
                    console.info(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
                })
            }

            if (networkError) console.info(`[Network error]: ${networkError}`)
        }),
        httpLink,
    ])

    const cache = new InMemoryCache().restore(initialState || {})

    const client = new ApolloClient({
        cache,
        connectToDevTools: isBrowser,
        link,
        resolvers,
        ssrMode: !isBrowser,
        typeDefs,
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

    return apolloClient
}
