import React from 'react'
// import Head from 'next/head'
import { NextComponentType } from 'next'
import { ApolloProvider } from '@apollo/react-hooks'
import initApolloClient from './client'

export default function(
    PageComponent: NextComponentType<any, any, any>
    // { ssr = true } = {}
) {
    const WithApollo = ({ apolloClient, apolloState, ...pageProps }: any) => {
        const client = apolloClient || initApolloClient(apolloState)
        return (
            <ApolloProvider client={client}>
                <PageComponent {...pageProps} />
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

    // if (ssr || PageComponent.getInitialProps) {
    //     WithApollo.getInitialProps = async (ctx: any) => {
    //         const { AppTree } = ctx

    //         // Initialize ApolloClient, add it to the ctx object so
    //         // we can use it in `PageComponent.getInitialProp`.
    //         const apolloClient = (ctx.apolloClient = initApolloClient())

    //         // Run wrapped getInitialProps methods
    //         let pageProps = {}
    //         if (PageComponent.getInitialProps) {
    //             pageProps = await PageComponent.getInitialProps(ctx)
    //         }

    //         // Only on the server:
    //         if (typeof window === 'undefined') {
    //             // When redirecting, the response is finished.
    //             // No point in continuing to render
    //             if (ctx.res && ctx.res.finished) {
    //                 return pageProps
    //             }

    //             // Only if ssr is enabled
    //             if (ssr) {
    //                 try {
    //                     // Run all GraphQL queries
    //                     const { getDataFromTree } = await import('@apollo/react-ssr')
    //                     await getDataFromTree(
    //                         <AppTree
    //                             pageProps={{
    //                                 ...pageProps,
    //                                 apolloClient,
    //                             }}
    //                         />
    //                     )
    //                 } catch (error) {
    //                     // Prevent Apollo Client GraphQL errors from crashing SSR.
    //                     // Handle them in components via the data.error prop:
    //                     // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
    //                     console.error('Error while running `getDataFromTree`', error)
    //                 }

    //                 // getDataFromTree does not call componentWillUnmount
    //                 // head side effect therefore need to be cleared manually
    //                 Head.rewind()
    //             }
    //         }

    //         // Extract query data from the Apollo store
    //         const apolloState = apolloClient.cache.extract()

    //         return {
    //             ...pageProps,
    //             apolloState,
    //         }
    //     }
    // }

    return WithApollo
}
