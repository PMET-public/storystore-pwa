import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import CartTemplate from '~/components/Cart'

type CartProps = {}

const Cart: NextPage<CartProps> = ({}) => {
    return <CartTemplate />
}

export default withApollo(withStoryStore(Cart))
