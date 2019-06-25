import React from 'react'
import App, { Container } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import withApolloClient from '@app/hocs/withApolloClient'
import { ThemeProvider } from 'luma-storybook/dist/theme'

class MyApp extends App {
    render() {
        const { Component, pageProps, apolloClient }: any = this.props
        return (
            <Container>
                <ApolloProvider client={apolloClient}>
                    <ThemeProvider
                        typography={{
                            body: {
                                family: 'source-sans pro, sans-serif',
                            },
                            headings: {
                                family: 'rucksack, sans-serif',          
                            },
                        }}
                    >
                        <Component {...pageProps} />
                    </ThemeProvider>
                </ApolloProvider>
            </Container>
        )
    }
}

export default withApolloClient(MyApp)