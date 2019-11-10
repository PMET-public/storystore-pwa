import React from 'react'
import { useRouter } from 'next/router'
import CartLanding from 'luma-ui/dist/templates/CartLanding'
import Button from 'luma-ui/dist/components/Button'
import Link from '../../components/Link'

export const Confirmation = () => {
    const router = useRouter()

    const { order } = router.query

    return (
        <CartLanding
            title={{
                text: 'Thank you for your order!',
            }}
            success
            children={
                <div>
                    {order && <p>Your order # is: {order}.</p>}
                    <p>We'll email you details and tracking info.</p>
                    <Button as={Link} urlResolver href="/" style={{ marginTop: '2rem' }}>
                        Continue Shopping
                    </Button>
                </div>
            }
        />
    )
}

export default Confirmation
