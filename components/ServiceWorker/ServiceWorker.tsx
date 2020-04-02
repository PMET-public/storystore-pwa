import React, { useMemo, createContext, useContext, FunctionComponent, useCallback } from 'react'
import { Workbox } from 'workbox-window'
import { toast } from '@pmet-public/luma-ui/dist/lib'
import { useRouter } from 'next/router'
import { version } from '../../package.json'
import styled from 'styled-components'

const Toast = styled.div`
    display: grid;
    grid-gap: 1rem;

    & > button {
        background-color: #fff;
        border-radius: 2.4rem;
        box-sizing: border-box;
        color: #222;
        cursor: pointer;
        display: inline-flex;
        font-weight: 800;
        padding: 1rem 2.2rem;
        place-content: center;
    }
`

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
                    <Toast>
                        🎉 A new update ({version}) is available.
                        <button className="button" onClick={handleReloadApp}>
                            Reload
                        </button>{' '}
                    </Toast>,
                    {
                        autoClose: false,
                        closeButton: false,
                        onClose: handleReloadApp,
                    }
                )
            }
        })

        /**
         * On Activation
         */
        wb.addEventListener('activated', _event => {
            // Get the current page URL + all resources the page loaded.
            const urlsToCache = [
                new URL('/', window.location.href).href,
                new URL('/search', window.location.href).href,
                new URL('/cart', window.location.href).href,
                new URL('/checkout', window.location.href).href,
                ...performance.getEntriesByType('resource').map(r => r.name),
            ]

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
