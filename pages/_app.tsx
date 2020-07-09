import React, { useCallback, useEffect } from 'react'
import { NextPage } from 'next'
import { AppProps } from 'next/app'
import { version } from '~/package.json'
import ReactGA from 'react-ga'
import Router from 'next/router'

import useServiceWorker from '~/hooks/useServiceWorker'
import useStoryStore from '~/hooks/useStoryStore'

const MyApp: NextPage<AppProps> = ({ Component, pageProps }) => {
    const { settings } = useStoryStore()

    const workbox = useServiceWorker()

    /**
     * Google Analytics
     */
    useEffect(() => {
        if (process.env.GOOGLE_ANALYTICS) {
            ReactGA.initialize(process.env.GOOGLE_ANALYTICS)
        }
    }, [])

    useEffect(() => {
        if (!process.env.GOOGLE_ANALYTICS) {
            ReactGA.set({ dimension1: version }) // version

            ReactGA.set({ dimension2: window.location.host }) // release

            if (settings.magentoUrl) {
                ReactGA.set({ dimension3: new URL(settings.magentoUrl).host }) // endpoint
            }

            ReactGA.pageview(window.location.pathname)
        }
    }, [settings])

    /**
     * Handle Route changes
     */
    const handleRouteChange = useCallback(
        (url, error?: any) => {
            if (error) return

            workbox?.messageSW({
                type: 'CACHE_URLS',
                payload: {
                    urlsToCache: [url],
                },
            })

            if (process.env.GOOGLE_ANALYTICS) {
                ReactGA.pageview(url)
            }
        },
        [workbox]
    )

    useEffect(() => {
        Router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [handleRouteChange])

    return <Component {...pageProps} />
}

export default MyApp
