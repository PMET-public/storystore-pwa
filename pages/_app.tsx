import React, { useEffect, useCallback } from 'react'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'
import { version } from '../package.json'
import { useServiceWorker } from 'hooks/useServiceWorker'
import NextNprogress from 'nextjs-progressbar'
import App from '../components/App'
import ReactGA from 'react-ga'
import Router from 'next/router'
import { NextComponentType, NextPageContext } from 'next'
import { withApollo } from '../lib/apollo/withApollo'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'

const isProduction = process.env.NODE_ENV === 'production'

if (process.browser) {
    if (isProduction) {
        /**
         * Google Analytics
         */
        ReactGA.initialize('UA-162672258-1')
    }
}

const MyApp: NextComponentType<NextPageContext, any, any> = ({ Component, pageProps, env }) => {
    const workbox = useServiceWorker()

    /**
     * Update SW Cache on Route change
     */
    const handleRouteChange = useCallback(
        (url, error?: any) => {
            if (error || !workbox) return

            workbox.messageSW({
                type: 'CACHE_URLS',
                payload: {
                    urlsToCache: [url],
                },
            })

            ReactGA.pageview(url)
        },
        [workbox]
    )

    useEffect(() => {
        Router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange)
        }
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
        <AppProvider>
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
        </AppProvider>
    )
}

MyApp.getInitialProps = async ({ ctx, Component }: any) => {
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
        )(ctx.req?.headers.cookie),
    }

    return {
        pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : undefined,
        env,
    }
}

export default withApollo({ ssr: true })(MyApp)
