import React, { useEffect } from 'react'
import { NextComponentType } from 'next'

import withApollo from '../apollo/with-apollo'
import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'
import { Workbox } from 'workbox-window'

import App from '../components/App'

const MyApp: NextComponentType<any, any, any> = ({ Component, pageProps }) => {
    const categoryParentId = process.env.CATEGORIES_PARENT_ID
    const footerBlockId = process.env.FOOTER_BLOCK_ID

    /**
     * Service Workder
     */
    useEffect(() => {
        console.log(
            JSON.stringify(
                {
                    MAGENTO_URL: process.env.MAGENTO_URL,
                    HOME_PAGE_ID: process.env.HOME_PAGE_ID,
                    CATEGORIES_PARENT_ID: process.env.CATEGORIES_PARENT_ID,
                    FOOTER_BLOCK_ID: process.env.FOOTER_BLOCK_ID,
                },
                null,
                4
            ),
            '\n'
        )

        if (process.env.NODEV_ENV !== 'development' && 'serviceWorker' in navigator) {
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
