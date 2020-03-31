import React, { useMemo, createContext, useContext, FunctionComponent, useCallback } from 'react'
import { Workbox } from 'workbox-window'
import { toast } from '@pmet-public/luma-ui/dist/lib'
import { useRouter } from 'next/router'
import { version } from '../../package.json'

const ServiceWorkerContext = createContext<Workbox | undefined>(undefined)

export const useServiceWorker = () => useContext(ServiceWorkerContext)

export const ServiceWorkerProvider: FunctionComponent<{ url?: string; disableInDev?: boolean }> = ({
    children,
    url = '/service-worker.js',
    disableInDev = true,
}) => {
    const router = useRouter()

    const handleReloadApp = useCallback(() => {
        router.reload()
    }, [router])

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
                toast.info(
                    <>
                        A new update ({version}) is available. <button onClick={handleReloadApp}>Reload</button>.
                    </>
                )
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
