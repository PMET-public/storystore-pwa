import React, { FunctionComponent } from 'react'

import { useRouter } from 'next/router'

import CartLanding from '@pmet-public/luma-ui/components/CartLanding'
import Button from '@pmet-public/luma-ui/components/Button'
import Link from '../Link'
import Head from '../Head'

export type ConfirmationProps = {}

export const Confirmation: FunctionComponent = () => {
    const { query } = useRouter()

    const { orderId } = query

    return (
        <React.Fragment>
            <Head title="Order Completed! 🙌" />

            <CartLanding
                title={{
                    text: 'Thank you for your order!',
                }}
                success
                children={
                    <div>
                        {orderId && <p>Your order # is: {orderId}.</p>}
                        <p>We'll email you details and tracking info.</p>
                        <Button as={Link} href="/" style={{ marginTop: '2rem' }}>
                            Continue Shopping
                        </Button>
                    </div>
                }
            />
        </React.Fragment>
    )
}
