import React from 'react'
import { NextPage } from 'next'

import { withApollo } from '~/lib/apollo/withApollo'

import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useRouter } from 'next/router'
import useValueUpdated from '~/hooks/useValueUpdated'

import App from '~/components/App'
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

    return (
        <App>
            <Error type="Offline" />
        </App>
    )
}

export default withApollo(Offline)
