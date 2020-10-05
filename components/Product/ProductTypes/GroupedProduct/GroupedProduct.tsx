import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { Root, Item, Title, PriceContainer } from './GroupedProduct.styled'
import Form, { Input, Quantity } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Price from '@storystore/ui/dist/components/Price'
import { useProductLayout } from '../../Product'

export type GroupedProductProps = {
    group: Array<{
        product: {
            sku: string
            name: string
            price: any
            quantity: number
            stock?: string
        }
    }>
}

export const GroupedProduct: FunctionComponent<GroupedProductProps> = ({ group }) => {
    const { cartId } = useStoryStore()

    const { setPrice } = useProductLayout()

    /**
     * Remove Price
     */
    useMemo(() => setPrice(null), [setPrice])

    const { addSimpleProductToCart, addingSimpleProductsToCart } = useCart({ cartId })

    const history = useRouter()

    const items = group?.map(({ product }) => ({
        quantity: product.quantity,
        sku: product.sku,
        name: product.name,
        price: product.price,
        stock: product.stock,
    }))

    const handleAddToCart = useCallback(
        async ({ items }) => {
            if (!cartId || addingSimpleProductsToCart.loading) return

            await addSimpleProductToCart(items.filter((item: any) => item.data.quantity > 0))

            await history.push('/cart')

            window.scrollTo(0, 0)
        },
        [cartId, addingSimpleProductsToCart.loading, addSimpleProductToCart, history]
    )

    return (
        <Root as={Form} onSubmit={handleAddToCart}>
            {items?.map(({ sku, name, price, stock, quantity }, key) => (
                <Item key={key}>
                    <Title>{name}</Title>

                    <Input type="hidden" name={`items[${key}].data.sku`} value={sku} rules={{ required: true }} />

                    <PriceContainer>
                        <Price
                            label={price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined}
                            regular={price.minimum.regular.value}
                            special={price.minimum.discount.amountOff && price.minimum.final.value - price.minimum.discount.amountOff}
                            currency={price.minimum.regular.currency}
                        />

                        <Quantity
                            name={`items[${key}].data.quantity`}
                            defaultValue={stock === 'IN_STOCK' ? quantity : 0}
                            disabled={stock === 'IN_STOCK'}
                            addLabel="Add"
                            removeLabel="Remove"
                            minValue={0}
                            min={0}
                            rules={{ required: true }}
                            hideError
                        />
                    </PriceContainer>
                </Item>
            ))}
            <Button type="submit" as="button" text="Add to Cart" loading={addingSimpleProductsToCart.loading} />
        </Root>
    )
}
