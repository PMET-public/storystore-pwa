import React from 'react'
import { NextPage } from 'next'
import { withStoryStore } from '~/lib/storystore'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'
import CartTemplate, { useCart } from '~/components/Cart'

const Cart: NextPage = () => {
    const { cartId } = useStoryStore()

    const cart = useCart({ cartId })

    return <CartTemplate {...cart} />
}

export default withStoryStore(Cart)
