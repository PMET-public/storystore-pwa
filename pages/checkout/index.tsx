import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import StoryStoreProvider, { StoryStore } from '~/lib/storystore'

import { useRouter } from 'next/router'

import App from '~/components/App'
import CheckoutTemplate from '~/components/Checkout'

type CheckoutProps = {
    storyStore: StoryStore
}

export const Checkout: NextPage<CheckoutProps> = ({ storyStore }) => {
    const router = useRouter()

    return (
        <StoryStoreProvider {...storyStore}>
            <App router={router}>
                <CheckoutTemplate />
            </App>
        </StoryStoreProvider>
    )
}

export default withApollo({ ssr: false })(Checkout)
