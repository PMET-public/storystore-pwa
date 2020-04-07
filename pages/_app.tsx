import React, { useEffect } from 'react'
import { NextPage } from 'next'
import { withApollo } from '../lib/apollo/withApollo'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'
import { version } from '../package.json'
import ReactGA from 'react-ga'
import ServiceWorkerProvider from 'components/ServiceWorker'

import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import App from '../components/App'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'
import { useApolloClient } from '@apollo/react-hooks'

const isProduction = process.env.NODE_ENV === 'production'

if (process.browser) {
    if (isProduction) {
        /**
         * Google Analytics
         */
        ReactGA.initialize('UA-162672258-1')
    }
}

const MyApp: NextPage<any> = ({ Component, req, pageProps }) => {
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

    const apolloClient = useApolloClient()

    /**
     * TypeKit
     */
    /**
     * TypeKit (Fonts)
     */
    useEffect(() => {
        const myCSS = document.createElement('link')
        myCSS.rel = 'stylesheet'
        myCSS.href = '/static/fonts.css'
        document.head.insertBefore(myCSS, document.head.childNodes[document.head.childNodes.length - 1].nextSibling)
    }, [])

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

    return (
        <ServiceWorkerProvider>
            <AppProvider>
                {apolloClient ? (
                    <App footerBlockId={env.FOOTER_BLOCK_ID}>
                        <NextNprogress
                            color="rgba(161, 74, 36, 1)"
                            startPosition={0.4}
                            stopDelayMs={200}
                            height={3}
                            options={{ showSpinner: false, easing: 'ease' }}
                        />
                        <Component env={env} {...pageProps} />
                    </App>
                ) : (
                    <ViewLoader />
                )}
            </AppProvider>
        </ServiceWorkerProvider>
    )
}

MyApp.getInitialProps = async ({ req }) => {
    return {
        req,
    }
}

export default withApollo(MyApp)
