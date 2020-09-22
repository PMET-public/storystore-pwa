import React, { FunctionComponent, useCallback } from 'react'
import Form, { Input, Quantity } from '@storystore/ui/dist/components/Form'
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
        async ({ items }) => {
            if (!cartId || !inStock || addingSimpleProductsToCart.loading) return

            await addSimpleProductToCart(items)

            await history.push('/cart')

            window.scrollTo(0, 0)
        },
        [addSimpleProductToCart, inStock, addingSimpleProductsToCart, history, cartId]
    )

    return (
        <Form onSubmit={handleAddToCart}>
            <Input name="items[0].data.sku" type="hidden" value={sku} rules={{ required: true }} />
            <Quantity name="items[0].data.quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError />
            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingSimpleProductsToCart.loading} />
        </Form>
    )
}
