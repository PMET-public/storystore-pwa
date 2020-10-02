import React, { FunctionComponent, useCallback } from 'react'
import { Root } from './SimpleProduct.styled'
import Form, { Input, Quantity } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'

export type SimpleProductProps = {
    sku: string
    stock?: 'IN_STOCK' | 'OUT_OF_STOCK'
}

export const SimpleProduct: FunctionComponent<SimpleProductProps> = ({ sku, stock = 'IN_STOCK' }) => {
    const { cartId } = useStoryStore()

    const { addSimpleProductToCart, addingSimpleProductsToCart } = useCart({ cartId })

    const history = useRouter()

    const inStock = stock !== 'IN_STOCK'

    const handleAddToCart = useCallback(
        async ({ items }) => {
            if (!cartId || !inStock || addingSimpleProductsToCart.loading) return

            await addSimpleProductToCart(items)

            await history.push('/cart')

            window.scrollTo(0, 0)
        },
        [addSimpleProductToCart, inStock, addingSimpleProductsToCart, history, cartId]
    )

    return (
        <Root as={Form} onSubmit={handleAddToCart}>
            <Input name="items[0].data.sku" type="hidden" value={sku} rules={{ required: true }} />
            <Quantity name="items[0].data.quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError />
            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingSimpleProductsToCart.loading} />
        </Root>
    )
}
