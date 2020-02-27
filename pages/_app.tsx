import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'

import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'
import { ApolloClient } from 'apollo-client'

import App from '../components/App'
import ServiceWorkerProvider from '../components/ServiceWorker'
import { ApolloProvider } from '@apollo/react-hooks'
import createApolloClient from '../apollo/client'

const MyApp: NextPage<any> = ({ Component, pageProps }) => {
    const [apolloClient, setApolloClient] = useState<ApolloClient<any> | undefined>(undefined)

    useEffect(() => {
        createApolloClient().then(client => {
            setApolloClient(client)
        })
    }, [])

    if (apolloClient === undefined) return <ViewLoader />

    return (
        <ApolloProvider client={apolloClient}>
            <ServiceWorkerProvider>
                <AppProvider>
                    <App
                        categoriesParentId={process.env.CATEGORIES_PARENT_ID}
                        footerBlockId={process.env.FOOTER_BLOCK_ID}
                    >
                        <NextNprogress
                            color="rgba(161, 74, 36, 1)"
                            startPosition={0.4}
                            stopDelayMs={200}
                            height={3}
                            options={{ showSpinner: false, easing: 'ease' }}
                        />
                        <Component {...pageProps} />
                    </App>
                </AppProvider>
            </ServiceWorkerProvider>
        </ApolloProvider>
    )
}

export default MyApp
