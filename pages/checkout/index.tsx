import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import CheckoutTemplate from '~/components/Checkout'

type CheckoutProps = {}

export const Checkout: NextPage<CheckoutProps> = ({}) => {
    return <CheckoutTemplate />
}

export default withApollo(withStoryStore(Checkout))
