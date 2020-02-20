import { offlineLink } from './../../apollo/client'
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
        addEventListener('online', handleNetworkChange)
        addEventListener('offline', handleNetworkChange)

        return () => {
            removeEventListener('online', handleNetworkChange)
            removeEventListener('offline', handleNetworkChange)
        }
    }, [])

    return online
}
