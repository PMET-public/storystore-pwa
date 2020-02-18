import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-link'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory'
import { persistCache } from 'apollo-cache-persist'
import { RetryLink } from 'apollo-link-retry'
import { onError } from 'apollo-link-error'
import QueueLink from 'apollo-link-queue'
import { defaults, typeDefs, resolvers } from './resolvers'
import { QueryHookOptions } from '@apollo/react-hooks'

let apolloClient: any

// Polyfill Server
if (!process.browser) {
    global.fetch = require('node-fetch')
    global.URL = require('url').URL
}

export const offlineLink = new QueueLink()

async function create(initialState: any) {
    const httpLink = new HttpLink({
        uri: process.browser
            ? new URL('/api/graphql', location.href).href
            : new URL('graphql', process.env.MAGENTO_URL).href,
        credentials: 'same-origin',
    })

    const retryLink = new RetryLink({
        delay: {
            initial: 300,
            max: Infinity,
            jitter: true,
        },
        attempts: {
            max: 3,
            retryIf: error => {
                if (process.browser) {
                    return !!error ? navigator.onLine : false
                }
                return false
            }, // retry only on front-end
        },
    })

    const link = ApolloLink.from([
        onError(({ graphQLErrors, networkError, response }) => {
            console.groupCollapsed('🚨 GraphQL Error')
            console.log('Response: ', response)
            if (graphQLErrors) {
                graphQLErrors.forEach(({ message, locations, path }) => {
                    console.info(`Message: ${message}`)
                    console.info('Location: ', locations)
                    console.info('Path: ', path)
                })
            }

            if (networkError) {
                console.info('Network error: ', networkError)
            }
            console.groupEnd()
        }),
        retryLink,
        offlineLink,
        httpLink,
    ])

    const cache = new InMemoryCache({
        // https://github.com/apollographql/react-apollo/issues/2387
        dataIdFromObject: (object: any) => {
            switch (object.__typename) {
                case 'SelectedConfigurableOption':
                    // Fixes cache
                    return object.id ? `${object.id}:${object.value}` : defaultDataIdFromObject(object)
                default:
                    return defaultDataIdFromObject(object)
            }
        },
    }).restore(initialState || {})

    cache.writeData({
        data: { ...defaults },
    })

    // await before instantiating ApolloClient, else queries might run before the cache is persisted
    if (process.browser) {
        await persistCache({ cache, storage: window.localStorage as any })
    }

    const client = new ApolloClient({
        cache,
        connectToDevTools: process.browser,
        link,
        resolvers,
        ssrMode: !process.browser,
        typeDefs,
    })

    return client
}

export default async function createApolloClient(initialState?: any) {
    // Make sure to create a new client for every server-side request so that data
    // isn't shared between connections (which would be bad)
    if (!process.browser) return await create(initialState)

    // Reuse client on the client-side
    if (!apolloClient) {
        apolloClient = await create(initialState)
    }

    return apolloClient
}

export const queryDefaultOptions: QueryHookOptions = {
    fetchPolicy: 'cache-and-network',
    // errorPolicy: 'all',
    returnPartialData: true,
    notifyOnNetworkStatusChange: true,
}
