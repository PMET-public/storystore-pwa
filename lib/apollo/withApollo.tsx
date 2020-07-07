import React from 'react'
import Head from 'next/head'
import App, { AppInitialProps } from 'next/app'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import { NextPage } from 'next'
import { ApolloProvider } from '@apollo/react-hooks'
import createApolloClient from './client'
import { getSettings } from '~/lib/getSettings'
import ApolloClient from 'apollo-client'

export interface ApolloProps {
    apolloState?: NormalizedCacheObject
    apolloClient: ApolloClient<NormalizedCacheObject>
}

export const initOnContext = (ctx: any) => {
    const inAppContext = Boolean(ctx.ctx)

    // We consider installing `withApollo` on global App level
    // as antipattern since it disables project wide Automatic Static Optimization.
    if (process.env.NODE_ENV === 'development') {
        if (inAppContext) {
            console.warn('Warning: You have opted-out of Automatic Static Optimization due to `withApollo` in `pages/_app`.\n' + 'Read more: https://err.sh/next.js/opt-out-auto-static-optimization\n')
        }
    }

    const cookie = (ctx.ctx || ctx).req?.headers.cookie

    const { magentoUrl } = getSettings(cookie)

    // Initialize ApolloClient if not already done
    const apolloClient = ctx.apolloClient || createApolloClient(magentoUrl, ctx.apolloState || {}, cookie)

    // We send the Apollo Client as a prop to the component to avoid calling initApollo() twice in the server.
    // Otherwise, the component would have to call initApollo() again but this
    // time without the context. Once that happens, the following code will make sure we send
    // the prop as `null` to the browser.

    apolloClient.toJSON = () => null

    // Add apolloClient to NextPageContext & NextAppContext.
    // This allows us to consume the apolloClient inside our
    // custom `getInitialProps({ apolloClient })`.
    ctx.apolloClient = apolloClient

    if (inAppContext) {
        ctx.ctx.apolloClient = apolloClient
    }

    return ctx
}

export const withApollo = (PageComponent: NextPage<any>) => {
    const WithApollo = ({ apolloClient, apolloState, ...pageProps }: ApolloProps & AppInitialProps) => {
        const { magentoUrl } = getSettings()

        let client

        if (apolloClient) {
            // Happens on: getDataFromTree & next.js ssr
            client = apolloClient
        } else {
            // Happens on: next.js csr
            client = createApolloClient(magentoUrl, apolloState, undefined)
        }

        return (
            <ApolloProvider client={client}>
                <PageComponent {...pageProps} />
            </ApolloProvider>
        )
    }

    // Set the correct displayName in development
    if (process.env.NODE_ENV !== 'production') {
        const displayName = PageComponent.displayName || PageComponent.name || 'Component'
        WithApollo.displayName = `withApollo(${displayName})`
    }

    if (PageComponent.getInitialProps) {
        WithApollo.getInitialProps = async (ctx: any) => {
            const inAppContext = Boolean(ctx.ctx)
            const { apolloClient } = initOnContext(ctx)

            // Run wrapped getInitialProps methods
            let pageProps = {}
            if (PageComponent.getInitialProps) {
                pageProps = await PageComponent.getInitialProps(ctx)
            } else if (inAppContext) {
                pageProps = await App.getInitialProps(ctx)
            }

            // Only on the server:
            if (typeof window === 'undefined') {
                const { AppTree } = ctx
                // When redirecting, the response is finished.
                // No point in continuing to render
                if (ctx.res && ctx.res.finished) {
                    return pageProps
                }

                // SSR - Only if dataFromTree is enabled
                if (AppTree) {
                    try {
                        // Import `@apollo/react-ssr` dynamically.
                        // We don't want to have this in our client bundle.
                        const { getDataFromTree } = await import('@apollo/react-ssr')
                        // To be used by StoryStore
                        // Since AppComponents and PageComponents have different context types
                        // we need to modify their props a little.
                        let props
                        if (inAppContext) {
                            props = { ...pageProps, apolloClient }
                        } else {
                            props = { pageProps: { ...pageProps, apolloClient } }
                        }
                        // Take the Next.js AppTree, determine which queries are needed to render,
                        // and fetch them. This method can be pretty slow since it renders
                        // your entire AppTree once for every query. Check out apollo fragments
                        // if you want to reduce the number of rerenders.
                        // https://www.apollographql.com/docs/react/data/fragments/
                        await getDataFromTree(<AppTree {...props} />)
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

            return {
                ...pageProps,
                // Extract query data from the Apollo store
                apolloState: apolloClient.cache.extract(),
                // Provide the client for ssr. As soon as this payload
                // gets JSON.stringified it will remove itself.
                apolloClient: ctx.apolloClient,
            }
        }
    }

    return WithApollo
}
