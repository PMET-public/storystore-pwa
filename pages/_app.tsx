import React from 'react'
import NextApp from 'next/app'
import withApollo from '../apollo/with-apollo'
import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'

import App from '../components/App'

class MyApp extends NextApp {
    async componentDidMount() {
        if ('serviceWorker' in navigator) {
            const { Workbox } = await import('workbox-window')

            const wb = new Workbox('/service-worker.js')

            wb.addEventListener('activated', _event => {
                // Get the current page URL + all resources the page loaded.
                const urlsToCache = [location.href, ...performance.getEntriesByType('resource').map(r => r.name)]

                // Send that list of URLs to your router in the service worker.
                wb.messageSW({
                    type: 'CACHE_URLS',
                    payload: { urlsToCache },
                })
            })

            // Register the service worker
            wb.register()
        }
    }

    render() {
        const { Component, pageProps } = this.props

        return (
            <AppProvider>
                <App>
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
        )
    }
}

export default withApollo(MyApp)
