import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { StoryStoreProvider } from '~/lib/storystore'

import App from '~/components/App'
import CartTemplate from '~/components/Cart'

type CartProps = {
    cookie?: string
}

const Cart: NextPage<CartProps> = ({ cookie }) => {
    return (
        <StoryStoreProvider cookie={cookie}>
            <App>
                <CartTemplate />
            </App>
        </StoryStoreProvider>
    )
}

Cart.getInitialProps = async ({ req }) => {
    return {
        cookie: req?.headers.cookie,
    }
}

export default withApollo({ ssr: true })(Cart)
