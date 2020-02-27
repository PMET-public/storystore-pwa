import { offlineLink } from './../../lib/apollo/client'
import { useState, useEffect, useCallback } from 'react'

export const useNetworkStatus = () => {
    const [online, setOnline] = useState(typeof navigator === 'undefined' || navigator.onLine)

    const handleNetworkChange = useCallback(() => {
        const { onLine } = navigator

        setOnline(onLine)

        if (onLine) {
            // To let requests pass (and execute all queued requests)
            offlineLink.open()
        } else {
            // To start queueing requests
            offlineLink.close()
        }
    }, [])

    useEffect(() => {
        window.addEventListener('online', handleNetworkChange)
        window.addEventListener('offline', handleNetworkChange)

        return () => {
            window.removeEventListener('online', handleNetworkChange)
            window.removeEventListener('offline', handleNetworkChange)
        }
    }, [handleNetworkChange])

    return online
}
