import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import StoryStoreProvider, { StoryStore } from '~/lib/storystore'

import { useRouter } from 'next/router'

import App from '~/components/App'
import { Confirmation as ConfirmationPage } from '~/components/Checkout/Confirmation'

type ConfirmationProps = {
    storyStore: StoryStore
}

export const Confirmation: NextPage<ConfirmationProps> = ({ storyStore }) => {
    const router = useRouter()

    return (
        <StoryStoreProvider {...storyStore}>
            <App router={router}>
                <ConfirmationPage />
            </App>
        </StoryStoreProvider>
    )
}

export default withApollo({ ssr: false })(Confirmation)
