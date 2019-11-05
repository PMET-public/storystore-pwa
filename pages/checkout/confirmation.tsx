import React from 'react'
import { useRouter } from 'next/router'
import ConfirmationTemplate from 'luma-ui/dist/templates/Confirmation'
import Button from 'luma-ui/dist/components/Button'
import Link from '../../components/Link'

export const Confirmation = () => {
    const router = useRouter()

    const { order } = router.query

    return (
        <ConfirmationTemplate
            title={{
                text: 'Thank you for your purchase',
            }}
            children={
                <div>
                    {order && <p>Your order # is: {order}.</p>}

                    <p>We'll email you an order confirmation with details and tracking info.</p>

                    <Button as={Link} urlResolver href="/" style={{ marginTop: '2rem' }}>
                        Continue Shopping
                    </Button>
                </div>
            }
        />
    )
}

export default Confirmation
