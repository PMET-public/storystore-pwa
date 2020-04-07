import ApolloClient from 'apollo-client'
import Head from 'next/head'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import { NextPage } from 'next'
import { ApolloProvider } from '@apollo/react-hooks'
import createApolloClient from './client'
import { overrideSettingsFromCookie } from '../overrideFromCookie'

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 */
export function withApollo<PageProps>(PageComponent: NextPage<PageProps>, { ssr = true } = {}) {
    type ApolloPageProps = PageProps & {
        apolloClient?: ApolloClient<NormalizedCacheObject> | null
        apolloState?: NormalizedCacheObject
    }

    const WithApollo: NextPage<ApolloPageProps> = ({ apolloClient, apolloState, ...pageProps }) => {
        const { MAGENTO_URL } = {
            MAGENTO_URL: process.env.MAGENTO_URL,
            ...overrideSettingsFromCookie('MAGENTO_URL')(),
        }

        const client = apolloClient || createApolloClient(MAGENTO_URL, apolloState)

        return (
            <ApolloProvider client={client}>
                <PageComponent {...((pageProps as any) as PageProps)} />
            </ApolloProvider>
        )
    }

    // Set the correct displayName in development
    if (process.env.NODE_ENV !== 'production') {
        const displayName = PageComponent.displayName || PageComponent.name || 'Component'

        if (displayName === 'App') {
            console.warn('This withApollo HOC only works with PageComponents.')
        }

        WithApollo.displayName = `withApollo(${displayName})`
    }

    if (ssr || PageComponent.getInitialProps) {
        WithApollo.getInitialProps = async ctx => {
            const { MAGENTO_URL } = {
                MAGENTO_URL: process.env.MAGENTO_URL,
                ...overrideSettingsFromCookie('MAGENTO_URL')(ctx.req?.headers),
            }

            console.log({ MAGENTO_URL })

            const { AppTree } = ctx

            // Initialize ApolloClient, add it to the ctx object so
            // we can use it in `PageComponent.getInitialProp`.
            const cookie = ctx.req?.headers?.cookie?.toString()
            const apolloClient = ((ctx as any).apolloClient = await createApolloClient(MAGENTO_URL, {}, cookie))

            // Run wrapped getInitialProps methods
            let pageProps = {} as PageProps
            if (PageComponent.getInitialProps) {
                pageProps = await PageComponent.getInitialProps(ctx)
            }

            // Only on the server:
            if (typeof window === 'undefined') {
                // When redirecting, the response is finished.
                // No point in continuing to render
                if (ctx.res && ctx.res.finished) {
                    return pageProps
                }

                // Only if ssr is enabled
                if (ssr) {
                    try {
                        // Run all GraphQL queries
                        const { getDataFromTree } = await import('@apollo/react-ssr')
                        await getDataFromTree(
                            <AppTree
                                pageProps={{
                                    ...pageProps,
                                    apolloClient,
                                }}
                            />
                        )
                    } catch (error) {
                        // Prevent Apollo Client GraphQL errors from crashing SSR.
                        // Handle them in components via the data.error prop:
                        // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
                        console.error('Error while running `getDataFromTree`', error)
                    }

                    // getDataFromTree does not call componentWillUnmount
                    // head side effect therefore need to be cleared manually
                    Head.rewind()
                }
            }

            // Extract query data from the Apollo store
            const apolloState = apolloClient.cache.extract()

            return {
                ...pageProps,
                apolloState,
            }
        }
    }

    return WithApollo
}
