import React from 'react'
import { GetStaticProps, NextPage } from 'next'
import { useQuery } from '@apollo/client'
import CheckoutTemplate, { CHECKOUT_QUERY } from '~/components/Checkout'
import { useStoryStore } from '~/lib/storystore'
import { initializeApollo } from '~/lib/apollo/client'
import { APP_QUERY } from '~/components/App'

export const Checkout: NextPage = () => {
    const { cartId } = useStoryStore()

    const checkout = useQuery(CHECKOUT_QUERY, {
        variables: { cartId },
        skip: !cartId,
    })

    return <CheckoutTemplate {...checkout} />
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

export default Checkout
