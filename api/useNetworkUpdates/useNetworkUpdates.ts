import { useCallback, useEffect } from 'react'
import { useApolloClient } from '@apollo/react-hooks'

export const useNetworkUpdates = () => {
    const client = useApolloClient()

    const handleNetworkChange = useCallback(() => {
        const isOnline = navigator.onLine
        client.writeData({ data: { isOnline } })
    }, [])

    useEffect(() => {
        window.addEventListener('online', handleNetworkChange)
        window.addEventListener('offline', handleNetworkChange)

        return () => {
            window.removeEventListener('online', handleNetworkChange)
            window.removeEventListener('offline', handleNetworkChange)
        }
    }, [])
}
