import { getSettings } from '~/lib/storystore'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import QueueLink from 'apollo-link-queue'
import possibleTypes from '~/lib/apollo/possibleTypes.json'
import { stripIgnoredCharacters } from 'graphql'

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
export const offlineLink: any = new QueueLink()

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
        uri: process.browser ? new URL('/graphql', location.href).href : new URL('graphql', magentoUrl).href,
        credentials: 'include',
        headers,

        // Warning: useGETForQueries risks exceeding URL length limits. These limits
        // in practice are typically set at or behind where TLS terminates. For Magento
        // Cloud and Fastly, 8kb is the maximum by default
        // https://docs.fastly.com/en/guides/resource-limits#request-and-response-limits
        useGETForQueries: true,

        fetch: (uri: string, options: RequestInit) => {
            let url = uri.toString()

            if (options?.method === 'GET') {
                const _url = new URL(url)

                // Read from URL implicitly decodes the querystring
                const query = _url.searchParams.get('query')

                if (!query) return uri

                const strippedQuery = stripIgnoredCharacters(query)

                // URLSearchParams.set will use application/x-www-form-urlencoded encoding
                _url.searchParams.set('query', strippedQuery)

                url = _url.toString()
            }

            return fetch(url, options) as any
        },
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
        offlineLink,
        httpLink,
    ])

    const cache = new InMemoryCache({
        possibleTypes,

        typePolicies: {
            /**
             * Use the same Key for all Product Types to make it easier to access
             */
            SimpleProduct: {
                keyFields: ({ id, urlKey }) => `Product:${urlKey || id}`,
            },
            VirtualProduct: {
                keyFields: ({ id, urlKey }) => `Product:${urlKey || id}`,
            },
            DownloadableProduct: {
                keyFields: ({ id, urlKey }) => `Product:${urlKey || id}`,
            },
            GiftCardProduct: {
                keyFields: ({ id, urlKey }) => `Product:${urlKey || id}`,
            },
            BundleProduct: {
                keyFields: ({ id, urlKey }) => `Product:${urlKey || id}`,
            },
            GroupedProduct: {
                keyFields: ({ id, urlKey }) => `Product:${urlKey || id}`,
            },
            ConfigurableProduct: {
                keyFields: ({ id, urlKey }) => `Product:${urlKey || id}`,
            },

            Query: {
                fields: {
                    categoryList(existing, { args, canRead, toReference }) {
                        /**
                         * Look for Category reference in Cache
                         */

                        if (args?.filters?.ids?.eq) {
                            const reference = toReference({
                                __typename: 'CategoryTree',
                                id: args.filters.ids.eq,
                            })

                            return canRead(reference) ? [{ ...reference }] : [{ ...existing }]
                        }

                        return existing
                    },
                    products(existing, { args, canRead, toReference }) {
                        /**
                         * Look for Product reference in Cache
                         */
                        if (args?.filter?.url_key?.eq) {
                            const reference = toReference({
                                __typename: 'Product',
                                id: args.filter.url_key.eq,
                            })

                            return canRead(reference) ? { ...existing, items: [{ ...reference }] } : { ...existing }
                        }
                        return { ...existing }
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
