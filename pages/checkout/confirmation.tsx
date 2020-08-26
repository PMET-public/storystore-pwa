import React from 'react'
import { GetStaticProps, NextPage } from 'next'

import { Confirmation as ConfirmationPage } from '~/components/Checkout/Confirmation'
import { initializeApollo } from '~/lib/apollo/client'
import { APP_QUERY } from '~/components/App'

export const Confirmation: NextPage = () => {
    return <ConfirmationPage />
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

export default Confirmation
