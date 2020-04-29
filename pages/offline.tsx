import React from 'react'
import { NextPage } from 'next'

import { withApollo } from '~/lib/apollo/withApollo'
import { StoryStoreProvider } from '~/lib/storystore'

import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useRouter } from 'next/router'
import useValueUpdated from '~/hooks/useValueUpdated'

import App from '~/components/App'
import Error from '~/components/Error'

export type OfflineProps = {
    cookie?: string
}

const Offline: NextPage<OfflineProps> = ({ cookie }) => {
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
        <StoryStoreProvider cookie={cookie}>
            <App>
                <Error type="Offline" />
            </App>
        </StoryStoreProvider>
    )
}

export default withApollo({ ssr: false })(Offline)
