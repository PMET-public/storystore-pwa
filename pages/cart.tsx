import React from 'react'

import CartTemplate from '../components/Cart'
import { NextPage } from 'next'

type CartProps = {}

const Cart: NextPage<CartProps> = () => {
    return <CartTemplate />
}

export default Cart
