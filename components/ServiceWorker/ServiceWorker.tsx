import React, { useMemo, createContext, useContext, FunctionComponent, useEffect, useCallback } from 'react'
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

    const wb = useMemo(() => {
        if (
            typeof navigator === 'undefined' ||
            !('serviceWorker' in navigator) ||
            (disableInDev && process.env.NODE_ENV !== 'production')
        ) {
            return undefined
        }

        return new Workbox(url)
    }, [url, disableInDev])

    const handleReloadApp = useCallback(() => {
        router.reload()
    }, [router])

    const handleServiceWorkerInstalled = useCallback(
        event => {
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
        },
        [handleReloadApp]
    )

    const handleServiceWorkerActivated = useCallback(
        _event => {
            if (!wb) return

            // Get the current page URL + all resources the page loaded.
            const urlsToCache = [...performance.getEntriesByType('resource').map(r => r.name)]

            // Send that list of URLs to your router in the service worker.
            wb.messageSW({
                type: 'CACHE_URLS',
                payload: { urlsToCache },
            })
        },
        [wb]
    )

    useEffect(() => {
        if (!wb) return

        wb.addEventListener('installed', handleServiceWorkerInstalled)
        wb.addEventListener('activated', handleServiceWorkerActivated)

        // Register the service worker
        wb.register().then(() => {
            console.log(`🙌 Luma PWA.`)
        })

        return () => {
            wb.removeEventListener('installed', handleServiceWorkerInstalled)
            wb.removeEventListener('activated', handleServiceWorkerActivated)
        }
    }, [wb])

    return <ServiceWorkerContext.Provider value={wb}>{children}</ServiceWorkerContext.Provider>
}
