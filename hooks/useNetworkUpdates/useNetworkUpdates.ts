import { useCallback, useEffect } from 'react'

export const useNetworkUpdates = (callback: (isOnline: boolean) => any) => {
    const handleNetworkChange = useCallback(() => {
        const isOnline = navigator.onLine
        callback(isOnline)
    }, [])

    useEffect(() => {
        callback(navigator.onLine)

        window.addEventListener('online', handleNetworkChange)
        window.addEventListener('offline', handleNetworkChange)

        return () => {
            window.removeEventListener('online', handleNetworkChange)
            window.removeEventListener('offline', handleNetworkChange)
        }
    }, [])
}
