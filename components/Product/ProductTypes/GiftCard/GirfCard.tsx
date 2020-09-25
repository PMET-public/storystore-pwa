import React, { FunctionComponent, useCallback } from 'react'
import { Root } from './GifCard.styled'
import Form from '@storystore/ui/dist/components/Form' // Quantity // Input,
// import Button from '@storystore/ui/dist/components/Button'
// import { useCart } from '~/hooks/useCart/useCart'
// import { useStoryStore } from '~/lib/storystore'
// import { useRouter } from 'next/router'

export type GifCardProps = {
    sku: string
    inStock?: boolean
}

export const GifCard: FunctionComponent<GifCardProps> = (
    {
        // sku, inStock = true
    }
) => {
    // const { cartId } = useStoryStore()

    // const { addGifCardToCart, addingGifCardsToCart } = useCart({ cartId })

    // const history = useRouter()

    const handleAddToCart = useCallback(async () => {}, [])

    return (
        <Root as={Form} onSubmit={handleAddToCart}>
            {/* <Input name="items[0].data.sku" type="hidden" value={sku} rules={{ required: true }} /> */}
            {/* <Quantity name="items[0].data.quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError /> */}
            {/* <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingGifCardsToCart.loading} /> */}
        </Root>
    )
}
