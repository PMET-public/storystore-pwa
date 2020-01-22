import React from 'react'
import { NextComponentType } from 'next'
import { ApolloProvider } from '@apollo/react-hooks'
import initApolloClient from './client'

export default function(PageComponent: NextComponentType<any, any, any>) {
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

    return WithApollo
}
