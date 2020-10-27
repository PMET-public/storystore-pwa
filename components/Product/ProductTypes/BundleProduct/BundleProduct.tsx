import React, { FunctionComponent, useCallback, useState } from 'react'
import { BUNDLE_PRODUCT_QUERY } from '.'
import { Root, OptionLabel } from './BundleProduct.styled'
import Form, { Input, Error, TextSwatches, Select, Checkbox, Quantity } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import Price from '@storystore/ui/dist/components/Price'
import { priceDataToProps } from '~/components/Product'

export type BundleProductProps = {
    sku: string
    inStock?: boolean
    urlKey: string
}

export const BundleProduct: FunctionComponent<BundleProductProps> = ({ sku, urlKey, inStock = true }) => {
    const { loading, data } = useQuery(BUNDLE_PRODUCT_QUERY, {
        variables: { filters: { url_key: { eq: urlKey } } },
        fetchPolicy: 'cache-and-network',
    })

    const product = data?.products?.items[0]

    const { cartId } = useStoryStore()

    const { addSimpleProductToCart, addingSimpleProductsToCart } = useCart({ cartId })

    const [error, setError] = useState<string | null>(null)

    const history = useRouter()

    const handleAddToCart = useCallback(
        async ({ items, options }) => {
            if (!cartId || !inStock || addingSimpleProductsToCart.loading) return

            console.log('handleAddToCart', { items, options })
            return

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

    if (loading && !product) return <>⏲ Loading...</>

    return (
        <Root as={Form} onSubmit={handleAddToCart}>
            <Input name="items[0].data.sku" type="hidden" value={sku} rules={{ required: true }} />

            {product.items
                ?.map(({ id, label, required, type, options }: any) => ({
                    _id: id,
                    type,
                    swatches: {
                        label,
                        name: `options[]`,
                        rules: { required },
                        items: options
                            .map(({ id: optionId, label, quantity, product }: any) => {
                                return {
                                    _id: optionId,
                                    label: (
                                        <OptionLabel>
                                            {label} <Price {...priceDataToProps(product.price)} /> x {quantity}
                                        </OptionLabel>
                                    ),
                                    value: product.id,
                                }
                            })
                            .sort((a: any, b: any) => b.position - a.position),
                    },
                }))
                .sort((a: any, b: any) => b.position - a.position)
                .map(({ _id, type, swatches }: any, index: number) => {
                    return (
                        <fieldset key={_id || index}>
                            {/* {type === 'TextSwatchData' && <TextSwatches hideError {...swatches} />} */}
                            {/* {type === undefined && <Select hideError blankDefault={`Select an option...`} {...swatches} />} */}
                            {type === 'checkbox' && <Checkbox {...swatches} />}
                        </fieldset>
                    )
                })}

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={false} />

            {error && <Error>{error}</Error>}
        </Root>
    )
}
