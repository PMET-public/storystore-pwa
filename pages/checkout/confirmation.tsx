import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { StoryStoreProvider } from '~/lib/storystore'

import App from '~/components/App'
import { Confirmation as ConfirmationPage } from '~/components/Checkout/Confirmation'

type ConfirmationProps = {
    cookie?: string
}

export const Confirmation: NextPage<ConfirmationProps> = ({ cookie }) => {
    return (
        <StoryStoreProvider cookie={cookie}>
            <App>
                <ConfirmationPage />
            </App>
        </StoryStoreProvider>
    )
}

export default withApollo({ ssr: false })(Confirmation)
