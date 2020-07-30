import React from 'react'
import { NextPage } from 'next'
import { useQuery } from '@apollo/client'
import CheckoutTemplate, { CHECKOUT_QUERY } from '~/components/Checkout'
import { useStoryStore } from '~/lib/storystore'

type CheckoutProps = {}

export const Checkout: NextPage<CheckoutProps> = ({}) => {
    const { cartId } = useStoryStore()

    const checkout = useQuery(CHECKOUT_QUERY, {
        variables: { cartId },
        skip: !cartId,
    })

    return <CheckoutTemplate {...checkout} />
}

export default Checkout
