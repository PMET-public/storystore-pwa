import App, { Container } from 'next/app'
import React from 'react'
import withApolloClient from '../lib/with-apollo-client'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-boost';

type Props = {
    apolloClient: ApolloClient<any>
}


class MyApp extends App<Props> {
    render() {
        const { Component, pageProps, apolloClient } = this.props
        return (
            <Container>
                <ApolloProvider client={apolloClient}>
                    <Component {...pageProps} />
                </ApolloProvider>
            </Container>
        )
    }
}

export default withApolloClient(MyApp)