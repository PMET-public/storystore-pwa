import React from 'react'
import { NextPage } from 'next'
import { withStoryStore } from '~/lib/storystore'

import CheckoutTemplate from '~/components/Checkout'

type CheckoutProps = {}

export const Checkout: NextPage<CheckoutProps> = ({}) => {
    return <CheckoutTemplate />
}

export default withStoryStore(Checkout)
