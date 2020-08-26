import React from 'react'
import { GetStaticProps, NextPage } from 'next'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useRouter } from 'next/router'
import useValueUpdated from '~/hooks/useValueUpdated'
import Error from '~/components/Error'
import { initializeApollo } from '~/lib/apollo/client'
import { APP_QUERY } from '~/components/App'

const Offline: NextPage = () => {
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

/**
 * Static Pre-rendeing
 */
export const getStaticProps: GetStaticProps | undefined = Boolean(process.env.CLOUD_MODE)
    ? undefined
    : async () => {
          const apolloClient = initializeApollo()

          await apolloClient.query({ query: APP_QUERY, errorPolicy: 'all' }) // Preload App Data

          return {
              props: {
                  initialState: apolloClient.cache.extract(),
              },
          }
      }

export default Offline
