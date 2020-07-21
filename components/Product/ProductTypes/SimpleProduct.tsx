import React, { FunctionComponent, useCallback } from 'react'
import Form from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'

export type SimpleProductProps = {
    sku: string
    inStock?: boolean
}

export const SimpleProduct: FunctionComponent<SimpleProductProps> = ({ sku, inStock = true }) => {
    const { cartId } = useStoryStore()

    const { addSimpleProductToCart, addingSimpleProductsToCart } = useCart({ cartId })

    const history = useRouter()

    const handleAddToCart = useCallback(
        async ({ quantity = 1 }) => {
            if (!cartId || !inStock || addingSimpleProductsToCart.loading) return

            await addSimpleProductToCart({ sku, quantity })

            await history.push('/cart')

            window.scrollTo(0, 0)
        },
        [sku, addSimpleProductToCart, inStock, addingSimpleProductsToCart, history, cartId]
    )

    return (
        <Form onSubmit={handleAddToCart}>
            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingSimpleProductsToCart.loading} />
        </Form>
    )
}
