import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'
import createApolloClient from '../lib/apollo/client'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient } from 'apollo-client'

import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import App from '../components/App'
import ServiceWorkerProvider from '../components/ServiceWorker'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'

const MyApp: NextPage<any> = ({ Component, pageProps, MAGENTO_URL, FOOTER_BLOCK_ID }) => {
    const [client, setClient] = useState<ApolloClient<any> | undefined>(undefined)

    useEffect(() => {
        createApolloClient(MAGENTO_URL).then(client => setClient(client))
    }, [MAGENTO_URL, setClient])

    if (client === undefined) return <ViewLoader />

    return (
        <ApolloProvider client={client}>
            <ServiceWorkerProvider>
                <AppProvider>
                    <App footerBlockId={FOOTER_BLOCK_ID}>
                        <NextNprogress
                            color="rgba(161, 74, 36, 1)"
                            startPosition={0.4}
                            stopDelayMs={200}
                            height={3}
                            options={{ showSpinner: false, easing: 'ease' }}
                        />
                        <Component apolloClient={client} {...pageProps} />
                    </App>
                </AppProvider>
            </ServiceWorkerProvider>
        </ApolloProvider>
    )
}

MyApp.getInitialProps = async appContext => {
    const MAGENTO_URL = process.env.MAGENTO_URL

    const { req } = (appContext as any).ctx

    const { Component } = appContext as any

    const pageProps = Component.getInitialProps ? await Component.getInitialProps(appContext) : {}

    return {
        pageProps,
        MAGENTO_URL,
        FOOTER_BLOCK_ID: process.env.FOOTER_BLOCK_ID,
        ...overrideSettingsFromCookie('MAGENTO_URL', 'FOOTER_BLOCK_ID')(req?.headers),
    }
}

export default MyApp
