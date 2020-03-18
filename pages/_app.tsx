import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'

import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'
import { ApolloClient } from 'apollo-client'
import { getCookieValueFromString } from '../lib/cookies'

import App from '../components/App'
import ServiceWorkerProvider from '../components/ServiceWorker'
import { ApolloProvider } from '@apollo/react-hooks'
import createApolloClient from '../lib/apollo/client'

const MyApp: NextPage<any> = ({ Component, pageProps, overrideMagentoUrl }) => {
    const [apolloClient, setApolloClient] = useState<ApolloClient<any> | undefined>(undefined)

    useEffect(() => {
        createApolloClient({}, overrideMagentoUrl).then((client: ApolloClient<any>) => {
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

MyApp.getInitialProps = async ({ ctx: { req } }: any) => {
    const overrideMagentoUrl = req.headers.cookie && getCookieValueFromString(req.headers.cookie, 'MAGENTO,URL')
    return { overrideMagentoUrl }
}

export default MyApp
