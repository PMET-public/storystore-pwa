import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import App from '~/components/App'
import CheckoutTemplate from '~/components/Checkout'

type CheckoutProps = {}

export const Checkout: NextPage<CheckoutProps> = ({}) => {
    return (
        <App>
            <CheckoutTemplate />
        </App>
    )
}

export default withApollo(Checkout)
