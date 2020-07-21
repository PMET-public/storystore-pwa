import React from 'react'
import { NextPage } from 'next'

import CheckoutTemplate from '~/components/Checkout'

type CheckoutProps = {}

export const Checkout: NextPage<CheckoutProps> = ({}) => {
    return <CheckoutTemplate />
}

export default Checkout
