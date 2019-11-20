import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import { ApolloProvider } from '@apollo/react-hooks'
import { getDataFromTree } from '@apollo/react-ssr'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import initApollo from '../apollo/client'
import NextNprogress from 'nextjs-progressbar'

import AppShell from '../components/App'

class MyApp extends App {
    render() {
        const { Component, pageProps, apolloClient }: any = this.props

        return (
            <ApolloProvider client={apolloClient}>
                <AppProvider>
                    <NextNprogress
                        color="rgba(161, 74, 36, 1)"
                        startPosition={0.4}
                        stopDelayMs={200}
                        height={3}
                        options={{ showSpinner: false, easing: 'ease' }}
                    />
                    <AppShell>
                        <Component {...pageProps} />
                    </AppShell>
                </AppProvider>
            </ApolloProvider>
        )
    }
}

/**
 * Apollo Wrapper
 * @param App
 */
export const apollo = initApollo()

const withApollo: any = (App: any) => {
    return class Apollo extends React.Component {
        apolloClient: any

        static async getInitialProps(ctx: any) {
            const { AppTree } = ctx

            let appProps = {}
            if (App.getInitialProps) {
                appProps = await App.getInitialProps(ctx)
            }

            // Run all GraphQL queries in the component tree
            // and extract the resulting data
            if (typeof window === 'undefined') {
                try {
                    // Run all GraphQL queries
                    await getDataFromTree(<AppTree {...appProps} apolloClient={apollo} />)
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

            // Extract query data from the Apollo store
            const apolloState = apollo.cache.extract()

            return {
                ...appProps,
                apolloState,
            }
        }

        constructor(props: any) {
            super(props)
            this.apolloClient = initApollo(props.apolloState)
        }

        render() {
            return <App apolloClient={this.apolloClient} {...this.props} />
        }
    }
}

export default withApollo(MyApp)
