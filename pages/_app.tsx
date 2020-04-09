import React, { useEffect, useMemo } from 'react'
import { AppProps } from 'next/app'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'
import { version } from '../package.json'
import ServiceWorkerProvider from 'components/ServiceWorker'
import { ApolloProvider } from '@apollo/react-hooks'
import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import App from '../components/App'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'
import { NextComponentType } from 'next'
import createApolloClient from '../lib/apollo/client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import ReactGA from 'react-ga'

const isProduction = process.env.NODE_ENV === 'production'

if (process.browser) {
    if (isProduction) {
        /**
         * Google Analytics
         */
        ReactGA.initialize('UA-162672258-1')
    }
}

const MyApp: NextComponentType<
    any,
    any,
    AppProps & {
        apolloClient?: ApolloClient<NormalizedCacheObject> | null
        apolloState?: NormalizedCacheObject
        cookie?: string
    }
> = ({ Component, apolloState, apolloClient: _apolloClient, cookie, pageProps }) => {
    const env = {
        MAGENTO_URL: process.env.MAGENTO_URL,
        HOME_PAGE_ID: process.env.HOME_PAGE_ID,
        FOOTER_BLOCK_ID: process.env.FOOTER_BLOCK_ID,
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ...overrideSettingsFromCookie('MAGENTO_URL', 'HOME_PAGE_ID', 'FOOTER_BLOCK_ID', 'GOOGLE_MAPS_API_KEY')(cookie),
    }

    const apolloClient = useMemo(() => _apolloClient || createApolloClient(env.MAGENTO_URL, apolloState), [
        _apolloClient,
        apolloState,
        env,
    ])

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

    if (!apolloClient) {
        return (
            <AppProvider>
                <ViewLoader />
            </AppProvider>
        )
    }

    return (
        <AppProvider>
            <ApolloProvider client={apolloClient}>
                <App footerBlockId={env.FOOTER_BLOCK_ID}>
                    <NextNprogress
                        color="rgba(161, 74, 36, 1)"
                        startPosition={0.4}
                        stopDelayMs={200}
                        height={3}
                        options={{ showSpinner: false, easing: 'ease' }}
                    />
                    <ServiceWorkerProvider>
                        <Component env={env} {...pageProps} />
                    </ServiceWorkerProvider>
                </App>
            </ApolloProvider>
        </AppProvider>
    )
}

export default MyApp
