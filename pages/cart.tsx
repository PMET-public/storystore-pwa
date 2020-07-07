import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import App from '~/components/App'
import CartTemplate from '~/components/Cart'

type CartProps = {}

const Cart: NextPage<CartProps> = ({}) => {
    return (
        <App>
            <CartTemplate />
        </App>
    )
}

export default withApollo(withStoryStore(Cart))
