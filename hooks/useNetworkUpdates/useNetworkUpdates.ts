import { useCallback, useEffect } from 'react'

export const useNetworkUpdates = (callback: (online: boolean) => any) => {
    const handleNetworkChange = useCallback(() => {
        const { onLine } = navigator

        callback(onLine)
    }, [])

    useEffect(() => {
        const { onLine } = navigator

        callback(onLine)

        window.addEventListener('online', handleNetworkChange)
        window.addEventListener('offline', handleNetworkChange)

        return () => {
            window.removeEventListener('online', handleNetworkChange)
            window.removeEventListener('offline', handleNetworkChange)
        }
    }, [])
}
