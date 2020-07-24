import React from 'react'
import { NextPage } from 'next'
import { useStoryStore } from '~/lib/storystore'
import CartTemplate, { CART_QUERY } from '~/components/Cart'
import { useQuery } from '@apollo/client'

const Cart: NextPage = () => {
    const { cartId } = useStoryStore()

    const cart = useQuery(CART_QUERY, { variables: { cartId }, skip: !cartId })

    return <CartTemplate {...cart} />
}

export default Cart
