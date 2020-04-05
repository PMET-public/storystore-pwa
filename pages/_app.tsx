import React, { useEffect, useState } from 'react'
import { NextPage, GetServerSideProps } from 'next'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'
import createApolloClient from '../lib/apollo/client'
import { ApolloProvider } from '@apollo/react-hooks'
import { version } from '../package.json'
import ReactGA from 'react-ga'
import ServiceWorkerProvider from 'components/ServiceWorker'
import ApolloClient from 'apollo-client'

import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import App from '../components/App'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'

const isProduction = process.env.NODE_ENV === 'production'

if (process.browser) {
    if (isProduction) {
        /**
         * Google Analytics
         */
        ReactGA.initialize('UA-162672258-1')
    }

    /**
     * WebFonts
     */
    const WebFont = require('webfontloader')

    WebFont.load({
        custom: {
            families: 'source-sans-pro, rucksack',
            urls: ['/static/fonts.css'],
        },
    })
}

const MyApp: NextPage<any> = ({ Component, req, pageProps }) => {
    const [apolloClient, setApolloClient] = useState<ApolloClient<any> | undefined>(undefined)

    const env = {
        MAGENTO_URL: process.env.MAGENTO_URL,
        HOME_PAGE_ID: process.env.HOME_PAGE_ID,
        FOOTER_BLOCK_ID: process.env.FOOTER_BLOCK_ID,
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ...overrideSettingsFromCookie(
            'MAGENTO_URL',
            'HOME_PAGE_ID',
            'FOOTER_BLOCK_ID',
            'GOOGLE_MAPS_API_KEY'
        )(req?.headers),
    }

    /**
     * Apollo Client (GraphQl)
     */
    const { MAGENTO_URL } = env

    useEffect(() => {
        createApolloClient(MAGENTO_URL).then(client => setApolloClient(client))
    }, [MAGENTO_URL, setApolloClient])

    /**
     * Google Analytics
     */
    useEffect(() => {
        if (!isProduction) return
        ReactGA.set({ dimension1: version }) // verion

        ReactGA.set({ dimension2: window.location.host }) // release

        if (env.MAGENTO_URL) {
            ReactGA.set({ dimension3: new URL(env.MAGENTO_URL).host }) // endpoint
        }

        ReactGA.pageview(window.location.pathname)
    }, [env])

    if (!apolloClient) return <ViewLoader />

    return (
        <ServiceWorkerProvider>
            <ApolloProvider client={apolloClient}>
                <AppProvider>
                    <App footerBlockId={env.FOOTER_BLOCK_ID}>
                        <NextNprogress
                            color="rgba(161, 74, 36, 1)"
                            startPosition={0.4}
                            stopDelayMs={200}
                            height={3}
                            options={{ showSpinner: false, easing: 'ease' }}
                        />
                        <Component apolloClient={apolloClient} env={env} {...pageProps} />
                    </App>
                </AppProvider>
            </ApolloProvider>
        </ServiceWorkerProvider>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    return {
        props: {
            req,
        },
    }
}

export default MyApp
