import React from 'react'
import { GetStaticProps, NextPage } from 'next'
import { useStoryStore } from '~/lib/storystore'
import CartTemplate, { CART_QUERY } from '~/components/Cart'
import { useQuery } from '@apollo/client'
import { initializeApollo } from '~/lib/apollo/client'
import { APP_QUERY } from '~/components/App'

const Cart: NextPage = () => {
    const { cartId } = useStoryStore()

    const cart = useQuery(CART_QUERY, { variables: { cartId }, skip: !cartId, fetchPolicy: 'cache-first', ssr: false })

    return <CartTemplate {...cart} />
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

export default Cart
