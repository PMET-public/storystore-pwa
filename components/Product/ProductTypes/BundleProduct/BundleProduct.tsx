import React, { FunctionComponent, useCallback, useState } from 'react'
import { BUNDLE_PRODUCT_QUERY } from '.'
import { Root, Configuration, Fieldset, OptionLabel, PriceWrapper } from './BundleProduct.styled'
import Form, { Input, Error, TextSwatches, Select, Checkbox, Quantity } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

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

    const [selections, setSelections] = useState([])

    const handleOnValues = useCallback(
        ({ items }) => {
            const _selections = items[0].bundle_options.map((x, i) => product.items[i].options.find(y => y.product.id === Number(x.value))?.canChangeQuantity)

            console.log('handleOnValues', { items, product, _selections })

            setSelections(_selections)
        },
        [product]
    )

    const handleAddToCart = useCallback(
        async ({ items }) => {
            if (!cartId || !inStock || addingSimpleProductsToCart.loading) return

            console.log('handleAddToCart', { items })
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
        <Root as={Form} onSubmit={handleAddToCart} onValues={handleOnValues}>
            <Input name="items[0].data.sku" type="hidden" value={sku} rules={{ required: true }} />
            <Input name="items[0].data.quantity" type="hidden" value={1} rules={{ required: true }} />

            <Configuration>
                {product.items
                    ?.map(({ id, label, required, type, options }: any, index: number) => ({
                        _id: id,
                        type,
                        swatches: {
                            label,
                            name: `items[0].bundle_options[${index}].value`,
                            rules: { required },
                            items: options
                                .map(({ id: optionId, label, isDefault, product }: any) => {
                                    return {
                                        _id: optionId,
                                        checked: isDefault,
                                        label:
                                            type === 'select' ? (
                                                `${label} +${product.price.minimum.regular.value.toLocaleString('en-US', { style: 'currency', currency: product.price.minimum.regular.currency })}`
                                            ) : (
                                                <OptionLabel>
                                                    {label} [{optionId}]
                                                    <PriceWrapper>
                                                        +{product.price.minimum.regular.value.toLocaleString('en-US', { style: 'currency', currency: product.price.minimum.regular.currency })}
                                                    </PriceWrapper>
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
                            <Fieldset key={_id || index}>
                                {type === 'radio' && <Checkbox hideError type="radio" {...swatches} />}

                                {type === 'select' && <Select hideError blankDefault={`Select an option...`} {...swatches} />}

                                {type === 'multi' && <TextSwatches hideError type="checkbox" {...swatches} />}

                                {type === 'checkbox' && <Checkbox hideError {...swatches} />}

                                <Quantity name={`items[0].bundle_options[${index}].quantity`} hideError rules={{ required: true }} disabled={!selections[index]} />

                                <Input name={`items[0].bundle_options[${index}].id`} type="hidden" value={_id} rules={{ required: true }} />
                            </Fieldset>
                        )
                    })}
            </Configuration>

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={false} />

            {error && <Error>{error}</Error>}
        </Root>
    )
}
