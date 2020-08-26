import React from 'react'
import { GetStaticProps, NextPage } from 'next'
import ErrorComponent from '~/components/Error'
import Link from '~/components/Link'
import { initializeApollo } from '~/lib/apollo/client'
import { APP_QUERY } from '~/components/App'

const Error: NextPage = () => {
    return <ErrorComponent type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
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

export default Error
