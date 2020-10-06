import React, { FunctionComponent, useCallback, useState } from 'react'
import { Root } from './BundledProduct.styled'
import Form, { Input, Error } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'

export type BundledProductProps = {
    sku: string
    inStock?: boolean
}

export const BundledProduct: FunctionComponent<BundledProductProps> = ({ sku, inStock = true }) => {
    const { cartId } = useStoryStore()

    const { addSimpleProductToCart, addingSimpleProductsToCart } = useCart({ cartId })

    const [error, setError] = useState<string | null>(null)

    const history = useRouter()

    const handleAddToCart = useCallback(
        async ({ items }) => {
            if (!cartId || !inStock || addingSimpleProductsToCart.loading) return

            try {
                setError(null)

                await addSimpleProductToCart(items)

                await history.push('/cart')

                window.scrollTo(0, 0)
            } catch (e) {
                setError(e.message)
            }
        },
        [addSimpleProductToCart, inStock, addingSimpleProductsToCart, history, cartId]
    )

    return (
        <Root as={Form} onSubmit={handleAddToCart}>
            <Input name="items[0].data.sku" type="hidden" value={sku} rules={{ required: true }} />
            {/* <Quantity name="items[0].data.quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError /> */}
            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={false} />
            {error && <Error>{error}</Error>}
        </Root>
    )
}
