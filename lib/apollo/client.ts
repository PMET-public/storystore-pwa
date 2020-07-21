import { getSettings } from '~/lib/storystore'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, defaultDataIdFromObject } from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import QueueLink from 'apollo-link-queue'
import possibleTypes from '~/lib/apollo/possibleTypes.json'

let apolloClient: ApolloClient<any>

/**
 * Polyfill Global Variables in Server
 */
if (!process.browser) {
    global.fetch = require('node-fetch')
    global.URL = require('url').URL
}

/**
 * apollo-link-queue (https://github.com/helfer/apollo-link-queue)
 * An Apollo Link that acts as a gate and queues requests when the gate is closed.
 * This can be used when there is no internet connection or when the user has
 * explicitly set an app to offline mode.
 */
export const offlineLink = new QueueLink()

if (process.browser) {
    window.addEventListener('offline', () => offlineLink.close())
    window.addEventListener('online', () => offlineLink.open())
}

/**
 * Create Apollo Client
 */
function createApolloClient(magentoUrl = process.env.MAGENTO_URL, cookie?: string) {
    const headers = cookie ? { cookie } : undefined

    const httpLink = new HttpLink({
        uri: process.browser ? new URL('/api/graphql', location.href).href : new URL('graphql', magentoUrl).href,
        credentials: 'include',
        headers,
    })

    const retryLink = new RetryLink({
        delay: {
            initial: 300,
            max: Infinity,
            jitter: true,
        },
        attempts: {
            max: 3,
            retryIf: (error: Error) => {
                if (process.browser) {
                    return !!error ? navigator.onLine : false
                }
                return false
            }, // retry only on front-end
        },
    })

    const link = ApolloLink.from([
        onError(({ graphQLErrors, networkError }) => {
            if (process.env.NODE_ENV !== 'production') {
                console.log(`  –––––––––––––––––––––––––––––––––––––––––––––––––`)
                console.groupCollapsed(`  🔥 GraphQL Error`)
                console.log(`📡 ${magentoUrl}`)
                if (graphQLErrors) {
                    graphQLErrors.forEach(({ message, path }) => {
                        console.info(`Message: ${message}`)
                        console.info('Path: ', path)
                    })
                }

                if (networkError) {
                    console.info('Network error: ', networkError)
                }
                console.log(`–––––––––––––––––––––––––––––––––––––––––––––––––`)
                console.groupEnd()
            }
        }),
        retryLink,
        // TODO: offlineLink,
        httpLink,
    ])

    const cache = new InMemoryCache({
        possibleTypes,

        typePolicies: {
            Query: {
                fields: {
                    braintreeToken: {
                        read() {
                            return ''
                        },
                    },
                    countries({ countries }) {
                        /**
                         * 🩹Patch:
                         * return countries sorted by name
                         * and filter empty values
                         */

                        if (!countries) return countries

                        return countries
                            .filter((x: any) => !!x.name)
                            .sort(function compare(a: any, b: any) {
                                // Use toUpperCase() to ignore character casing
                                const genreA = a.name.toUpperCase()
                                const genreB = b.name.toUpperCase()

                                let comparison = 0
                                if (genreA > genreB) {
                                    comparison = 1
                                } else if (genreA < genreB) {
                                    comparison = -1
                                }
                                return comparison
                            })
                    },
                },
            },
        },

        // https://github.com/apollographql/react-apollo/issues/2387
        dataIdFromObject: (object: any) => {
            switch (object.__typename) {
                case 'Cart':
                    return 'appCart' // we only need one Cart
                case 'SelectedConfigurableOption':
                    // Fixes cache
                    return object.id ? `${object.id}:${object.value}` : defaultDataIdFromObject(object)

                default:
                    return defaultDataIdFromObject(object)
            }
        },
    })

    const client = new ApolloClient({
        cache,
        connectToDevTools: process.browser,
        link,
        ssrMode: !process.browser,
        queryDeduplication: true,
    })

    return client
}

export function initializeApollo(initialState = null, cookie?: string) {
    // Override Magento URL w/ value from Cookie
    const { magentoUrl } = getSettings(cookie)

    const _apolloClient = apolloClient ?? createApolloClient(magentoUrl, cookie)

    // If your page has Next.js data fetching methods that use Apollo Client, the initial state
    // gets hydrated here
    if (initialState) {
        _apolloClient.cache.restore(initialState)
    }
    // For SSG and SSR always create a new Apollo Client
    if (typeof window === 'undefined') return _apolloClient
    // Create the Apollo Client once in the client
    if (!apolloClient) apolloClient = _apolloClient

    return _apolloClient
}
