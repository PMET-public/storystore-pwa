import { getSettings } from '~/lib/storystore'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
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
                    cart: {
                        keyArgs: () => 'AppCart',
                    },
                },
            },
            Cart: {
                keyFields: () => 'AppCart',
                fields: {
                    applied_coupons: {
                        merge(_, incoming) {
                            return incoming ? [...incoming] : null
                        },
                    },
                    applied_gift_cards: {
                        merge(_, incoming) {
                            return [...incoming]
                        },
                    },
                    available_payment_methods: {
                        merge(_, incoming) {
                            return [...incoming]
                        },
                    },
                    items: {
                        merge(_, incoming) {
                            return [...incoming]
                        },
                    },
                    prices: {
                        merge(existing = {}, incoming) {
                            return { ...existing, ...incoming }
                        },
                    },
                    shipping_addresses: {
                        merge(_, incoming) {
                            return [...incoming]
                        },
                    },
                },
            },
            SelectedConfigurableOption: {
                keyFields: ['id', 'value'],
            },
            Breadcrumb: {
                keyFields: ['category_id'],
            },
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

export function initializeApollo(initialState = null, cookie?: string, overrideMagentoUrl?: string) {
    // Override Magento URL w/ value from Cookie
    const { magentoUrl = overrideMagentoUrl } = getSettings(cookie)

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
