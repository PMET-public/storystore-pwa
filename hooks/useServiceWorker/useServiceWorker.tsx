import React, { useEffect, useCallback, useRef } from 'react'
import { Workbox } from 'workbox-window'
import { version } from '../../package.json'
import { useRouter } from 'next/router'
import styled from 'styled-components'

const toast = process.browser ? require('react-toastify').toast : {}

const Toast = styled.div`
    display: grid;
    grid-gap: 1rem;
    padding: 1rem;

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

export const useServiceWorker = () => {
    const router = useRouter()

    const wb = useRef<Workbox | undefined>()

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

    const handleServiceWorkerActivated = useCallback(() => {
        if (!wb.current) return

        // Get the current page URL + all resources the page loaded.
        const urlsToCache = [...performance.getEntriesByType('resource').map(r => r.name)]

        // Send that list of URLs to your router in the service worker.
        wb.current.messageSW({
            type: 'CACHE_URLS',
            payload: {
                urlsToCache: [window.location.href, ...urlsToCache],
            },
        })
    }, [wb])

    useEffect(() => {
        if (wb.current || process.env.NODE_ENV !== 'production' || !process.browser || !navigator?.serviceWorker) return

        wb.current = wb.current ?? new Workbox('/service-worker.js')

        wb.current.addEventListener('installed', handleServiceWorkerInstalled)
        wb.current.addEventListener('activated', handleServiceWorkerActivated)

        // Register the service worker
        wb.current.register().then(() => {
            console.log(`🙌 StoryStore PWA!`)
        })

        return () => {
            if (!wb.current) return
            wb.current.removeEventListener('installed', handleServiceWorkerInstalled)
            wb.current.removeEventListener('activated', handleServiceWorkerActivated)
        }
    }, [wb, handleServiceWorkerInstalled, handleServiceWorkerActivated])

    return wb.current
}
