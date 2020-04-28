import React, { FunctionComponent } from 'react'

import { useRouter } from 'next/router'

import CartLanding from '@pmet-public/storystore-ui/dist/components/CartLanding'
import Button from '@pmet-public/storystore-ui/dist/components/Button'
import Link from '~/components/Link'
import Head from '~/components/Head'

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
            >
                <div>
                    {orderId && <p>Your order # is: {orderId}.</p>}
                    <p>We&apos;ll email you details and tracking info.</p>
                    <Button as={Link} href="/" style={{ marginTop: '2rem' }}>
                        Continue Shopping
                    </Button>
                </div>
            </CartLanding>
        </React.Fragment>
    )
}
