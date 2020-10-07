import React from 'react'
import { NextPage } from 'next'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useRouter } from 'next/router'
import useValueUpdated from '~/hooks/useValueUpdated'
import Error from '~/components/Error'

export type OfflineProps = {}

const Offline: NextPage<OfflineProps> = ({}) => {
    const router = useRouter()

    const online = useNetworkStatus()

    /**
     * Refresh page url once is back online
     */
    useValueUpdated(() => {
        if (online) {
            router.reload()
        }
    }, online)

    return <Error type="Offline" fullScreen />
}

export default Offline
