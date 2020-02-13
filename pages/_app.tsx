import React, { useEffect } from 'react'
import { NextPage } from 'next'
// import { Workbox } from 'workbox-window'
import { version } from '../package.json'

import withApollo from '../apollo/with-apollo'
import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'

import App from '../components/App'

const MyApp: NextPage<any> = ({ Component, pageProps }) => {
    /**
     * Service Workder
     */
    useEffect(() => {
        if (process.browser) {
            console.log(`🙌 Luma PWA ${version}.`)
        }
        if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
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

            wb.addEventListener('installed', event => {
                if (event.isUpdate) {
                    console.log('A new version available. Please reload the app.')
                }
            })

            // Register the service worker
            wb.register()
        }
    }, [])

    return (
        <AppProvider>
            <App categoriesParentId={process.env.CATEGORIES_PARENT_ID} footerBlockId={process.env.FOOTER_BLOCK_ID}>
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
