import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import NextApp from 'next/app'

import 'react-toastify/dist/ReactToastify.css'

import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'
import { ApolloClient } from 'apollo-client'
import { getCookieValueFromString, getCookie } from '../lib/cookies'

import App from '../components/App'
import ServiceWorkerProvider from '../components/ServiceWorker'
import { ApolloProvider } from '@apollo/react-hooks'
import createApolloClient from '../lib/apollo/client'

const MyApp: NextPage<any> = ({ Component, pageProps, overrideMagentoUrl, footerBlockId, categoriesParentId }) => {
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
                    <App categoriesParentId={categoriesParentId} footerBlockId={footerBlockId}>
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

MyApp.getInitialProps = async appContext => {
    const { req } = (appContext as any).ctx

    const appProps = await NextApp.getInitialProps(appContext as any)

    const overrideMagentoUrl = process.browser
        ? getCookie('MAGENTO_URL')
        : req?.headers.cookie && getCookieValueFromString(req.headers.cookie, 'MAGENTO_URL')

    const footerBlockId =
        (process.browser
            ? getCookie('FOOTER_BLOCK_ID')
            : req?.headers.cookie && getCookieValueFromString(req.headers.cookie, 'FOOTER_BLOCK_ID')) ||
        process.env.FOOTER_BLOCK_ID

    const categoriesParentId =
        (process.browser
            ? getCookie('CATEGORIES_PARENT_ID')
            : req?.headers.cookie && getCookieValueFromString(req.headers.cookie, 'CATEGORIES_PARENT_ID')) ||
        process.env.CATEGORIES_PARENT_ID

    return {
        ...appProps,
        overrideMagentoUrl,
        footerBlockId,
        categoriesParentId,
    }
}

export default MyApp
