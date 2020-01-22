import React, { useEffect } from 'react'
import { NextComponentType } from 'next'

import withApollo from '../apollo/with-apollo'
import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import { Workbox } from 'workbox-window'

import App from '../components/App'

const MyApp: NextComponentType<any, any, any> = ({ Component, pageProps }) => {
    const mode = process.env.mode
    const categoryParentId = process.env.categoryParentId
    const footerBlockId = process.env.footerBlockId

    /**
     * Service Workder
     */
    useEffect(() => {
        if (mode !== 'development' && 'serviceWorker' in navigator) {
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
    }, [])

    return (
        <AppProvider>
            <App categoryParentId={categoryParentId} footerBlockId={footerBlockId}>
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

export default withApollo(MyApp)
