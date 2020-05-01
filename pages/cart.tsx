import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import App from '~/components/App'
import CartTemplate from '~/components/Cart'
import { useRouter } from 'next/router'

type CartProps = {}

const Cart: NextPage<CartProps> = ({}) => {
    const router = useRouter()

    return (
        <App router={router}>
            <CartTemplate />
        </App>
    )
}

export default withApollo(Cart)
