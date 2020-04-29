import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { StoryStoreProvider } from '~/lib/storystore'

import App from '~/components/App'
import CheckoutTemplate from '~/components/Checkout'

type CheckoutProps = {
    cookie?: string
}

export const Checkout: NextPage<CheckoutProps> = ({ cookie }) => {
    return (
        <StoryStoreProvider cookie={cookie}>
            <App>
                <CheckoutTemplate />
            </App>
        </StoryStoreProvider>
    )
}

export default withApollo({ ssr: false })(Checkout)
