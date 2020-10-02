import React, { FunctionComponent, useCallback } from 'react'
import { Root } from './VirtualProduct.styled'
import Form, { Quantity } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'

export type VirtualProductProps = {
    sku: string
    stock?: 'IN_STOCK' | 'OUT_OF_STOCK'
}

export const VirtualProduct: FunctionComponent<VirtualProductProps> = ({ sku, stock = 'IN_STOCK' }) => {
    const { cartId } = useStoryStore()

    const { addVirtualProductToCart, addingVirtualProductsToCart } = useCart({ cartId })

    const history = useRouter()

    const inStock = stock !== 'IN_STOCK'

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
        <Root as={Form} onSubmit={handleAddToCart}>
            <Quantity name="quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError />

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingVirtualProductsToCart.loading} />
        </Root>
    )
}
