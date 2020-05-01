import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import StoryStoreProvider, { StoryStore } from '~/lib/storystore'

import App from '~/components/App'
import CartTemplate from '~/components/Cart'
import { useRouter } from 'next/router'

type CartProps = {
    storyStore: StoryStore
}

const Cart: NextPage<CartProps> = ({ storyStore }) => {
    const router = useRouter()

    return (
        <StoryStoreProvider {...storyStore}>
            <App router={router}>
                <CartTemplate />
            </App>
        </StoryStoreProvider>
    )
}

Cart.getInitialProps = async ({ req }) => {
    return {
        storyStore: {
            cookie: req?.headers.cookie,
        },
    }
}

export default withApollo({ ssr: true })(Cart)
