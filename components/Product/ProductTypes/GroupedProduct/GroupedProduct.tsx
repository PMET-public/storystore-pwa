import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { Root, Item, Title, PriceContainer } from './GroupedProduct.styled'
import { GROUPED_PRODUCT_QUERY } from '.'
import { GroupedProducSkeleton } from './GroupedProduct.skeleton'
import Form, { Input, Quantity, Error } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Price from '@storystore/ui/dist/components/Price'
import { useProductLayout } from '../../Product'
import { useQuery } from '@apollo/client'

export type GroupedProductProps = {
    urlKey: string
}

export const GroupedProduct: FunctionComponent<GroupedProductProps> = ({ urlKey }) => {
    const { loading, data } = useQuery(GROUPED_PRODUCT_QUERY, {
        variables: { filters: { url_key: { eq: urlKey } } },
        fetchPolicy: 'cache-and-network',
    })

    const product = data?.products?.items[0]

    const { cartId } = useStoryStore()

    const { setPrice } = useProductLayout()

    /**
     * Remove Price
     */
    useMemo(() => setPrice(null), [setPrice])

    const { addSimpleProductToCart, addingSimpleProductsToCart } = useCart({ cartId })

    const history = useRouter()

    const [error, setError] = useState<string | null>(null)

    const items = product?.group?.map((group: any) => ({
        quantity: group.product.quantity,
        sku: group.product.sku,
        name: group.product.name,
        price: group.product.price,
        stock: group.product.stock,
    }))

    const handleAddToCart = useCallback(
        async ({ items }) => {
            if (!cartId || addingSimpleProductsToCart.loading) return

            try {
                setError(null)

                const values = items.filter((item: any) => item.data.quantity > 0)

                if (values.length === 0) return

                await addSimpleProductToCart(values)

                await history.push('/cart')

                window.scrollTo(0, 0)
            } catch (e) {
                setError(e.message)
            }
        },
        [cartId, addingSimpleProductsToCart.loading, addSimpleProductToCart, history]
    )

    if (loading && !product) return <GroupedProducSkeleton />

    if (!product) return null

    return (
        <Root as={Form} onSubmit={handleAddToCart}>
            {items.map(({ sku, name, price, stock, quantity }: any, key: number) => {
                const inStock = stock === 'IN_STOCK'

                return (
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
                                defaultValue={inStock ? quantity : 0}
                                disabled={!inStock}
                                addLabel="Add"
                                removeLabel="Remove"
                                minValue={0}
                                min={0}
                                rules={{ required: true }}
                                hideError
                            />
                        </PriceContainer>
                    </Item>
                )
            })}
            <Button type="submit" as="button" text="Add to Cart" loading={addingSimpleProductsToCart.loading} />

            {error && <Error>{error}</Error>}
        </Root>
    )
}
