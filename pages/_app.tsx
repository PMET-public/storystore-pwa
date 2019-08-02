import React from 'react'
import App, { Container } from 'next/app'
import { ApolloProvider } from '@apollo/react-hooks'
import withApolloClient from '../lib/with-apollo-client'
import { ThemeProvider } from 'luma-storybook/dist/theme'

import AppShell from '../components/App'

class MyApp extends App {
    render() {
        const { Component, pageProps, apolloClient }: any = this.props

        return (
            <Container>
                <ApolloProvider client={apolloClient}>
                    <ThemeProvider
                        typography={{
                            bodyFamily: 'source-sans pro, sans-serif',
                            headingFamily: 'rucksack, sans-serif',
                        }}
                    >
                        <AppShell>
                            <Component {...pageProps} />
                        </AppShell>
                    </ThemeProvider>
                </ApolloProvider>
            </Container>
        )
    }
}

export default withApolloClient(MyApp)
