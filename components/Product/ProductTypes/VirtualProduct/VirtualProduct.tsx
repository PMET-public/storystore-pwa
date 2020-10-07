import React, { FunctionComponent, useCallback, useState } from 'react'
import { Root } from './VirtualProduct.styled'
import Form, { Quantity, Error } from '@storystore/ui/dist/components/Form'
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

    const [error, setError] = useState<string | null>(null)

    const inStock = stock === 'IN_STOCK'

    const handleAddToCart = useCallback(
        async ({ quantity = 1 }) => {
            if (!cartId || !inStock || addingVirtualProductsToCart.loading) return

            try {
                await addVirtualProductToCart({ sku, quantity })

                await history.push('/cart')

                window.scrollTo(0, 0)
            } catch (e) {
                setError(e.message)
            }
        },
        [sku, addVirtualProductToCart, inStock, addingVirtualProductsToCart, history, cartId]
    )

    return (
        <Root as={Form} onSubmit={handleAddToCart}>
            <Quantity name="quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError />

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingVirtualProductsToCart.loading} />

            {error && <Error>{error}</Error>}
        </Root>
    )
}
