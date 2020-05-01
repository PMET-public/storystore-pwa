import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import { useRouter } from 'next/router'

import App from '~/components/App'
import CheckoutTemplate from '~/components/Checkout'

type CheckoutProps = {}

export const Checkout: NextPage<CheckoutProps> = ({}) => {
    const router = useRouter()

    return (
        <App router={router}>
            <CheckoutTemplate />
        </App>
    )
}

export default withApollo(Checkout)
