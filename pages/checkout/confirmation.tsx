import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import { useRouter } from 'next/router'

import App from '~/components/App'
import { Confirmation as ConfirmationPage } from '~/components/Checkout/Confirmation'

type ConfirmationProps = {}

export const Confirmation: NextPage<ConfirmationProps> = ({}) => {
    const router = useRouter()

    return (
        <App router={router}>
            <ConfirmationPage />
        </App>
    )
}

export default withApollo(Confirmation)
