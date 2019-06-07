import React from 'react'
import App, { Container } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import withApolloClient from '@app/hocs/withApolloClient'
import ThemeProvider from 'luma-storybook/dist/lib/theme'

class MyApp extends App {

    render() {
        const { Component, pageProps, apolloClient } = this.props
        return (
            <Container>
                <ApolloProvider client={apolloClient}>
                    <ThemeProvider>
                        <Component {...pageProps} />
                    </ThemeProvider>
                </ApolloProvider>
            </Container>
        )
    }
}

export default withApolloClient(MyApp)