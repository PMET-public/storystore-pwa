import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import App from '~/components/App'
import { Confirmation as ConfirmationPage } from '~/components/Checkout/Confirmation'

type ConfirmationProps = {}

export const Confirmation: NextPage<ConfirmationProps> = ({}) => {
    return (
        <App>
            <ConfirmationPage />
        </App>
    )
}

export default withApollo(Confirmation)
