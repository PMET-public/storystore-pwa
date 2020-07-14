import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'
import CartTemplate, { useCart } from '~/components/Cart'

const Cart: NextPage = () => {
    const { cartId } = useStoryStore()

    const cart = useCart({ cartId })

    return <CartTemplate {...cart} />
}

export default withApollo(withStoryStore(Cart))
