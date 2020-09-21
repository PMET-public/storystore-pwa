import React, { FunctionComponent, useCallback } from 'react'
import Form from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'

export type VirtualProductProps = {
    sku: string
    inStock?: boolean
}

export const VirtualProduct: FunctionComponent<VirtualProductProps> = ({ sku, inStock = true }) => {
    const { cartId } = useStoryStore()

    const { addVirtualProductToCart, addingVirtualProductsToCart } = useCart({ cartId })

    const history = useRouter()

    const handleAddToCart = useCallback(
        async ({ quantity = 1 }) => {
            if (!cartId || !inStock || addingVirtualProductsToCart.loading) return

            await addVirtualProductToCart({ sku, quantity })

            await history.push('/cart')

            window.scrollTo(0, 0)
        },
        [sku, addVirtualProductToCart, inStock, addingVirtualProductsToCart, history, cartId]
    )

    return (
        <Form onSubmit={handleAddToCart}>
            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingVirtualProductsToCart.loading} />
        </Form>
    )
}
