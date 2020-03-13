import React from 'react'
import { Workbox } from 'workbox-window'
import { useMemo, createContext, FunctionComponent } from 'react'

export const ServiceWorkerContext = createContext<Workbox | undefined>(undefined)

export const ServiceWorkerProvider: FunctionComponent<{ url?: string; disableInDev?: boolean }> = ({
    children,
    url = '/service-worker.js',
    disableInDev = true,
}) => {
    const wb = useMemo(() => {
        if (
            typeof navigator === 'undefined' ||
            !('serviceWorker' in navigator) ||
            (disableInDev && process.env.NODE_ENV !== 'production')
        ) {
            return undefined
        }

        console.log(`🙌 Luma PWA.`)

        const wb = new Workbox(url)

        /**
         * On Installation
         */
        wb.addEventListener('installed', event => {
            if (event.isUpdate) {
                console.log('A new version available. Please reload the app.')
            }
        })

        /**
         * On Activation
         */
        wb.addEventListener('activated', _event => {
            // Get the current page URL + all resources the page loaded.
            const urlsToCache = [window.location.href, ...performance.getEntriesByType('resource').map(r => r.name)]

            // Send that list of URLs to your router in the service worker.
            wb.messageSW({
                type: 'CACHE_URLS',
                payload: { urlsToCache },
            })
        })

        // Register the service worker
        wb.register()
    }, [url, disableInDev])

    return <ServiceWorkerContext.Provider value={wb}>{children}</ServiceWorkerContext.Provider>
}
