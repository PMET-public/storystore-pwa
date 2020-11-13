import React, { FunctionComponent, useCallback, useState } from 'react'
import { BUNDLE_PRODUCT_QUERY } from '.'
import { Root, Configuration, Fieldset, OptionLabel, PriceWrapper } from './BundleProduct.styled'
import Form, { Input, Error, TextSwatches, Select, Checkbox, Quantity } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import Price from '@storystore/ui/dist/components/Price'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { priceDataToProps } from '../../Product'

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

    const [selections, setSelections] = useState<[] | [{ quantity: number; canChangeQuantity: boolean; price: any }]>([])

    const handleOnValues = useCallback(
        ({ items }) => {
            const _selections = items[0].bundle_options.map((x: any, i: number) => {
                const p = product.items[i].options.find((y: any) => y.product.id === Number(x.value))
                return (
                    p && {
                        quantity: p.quantity,
                        canChangeQuantity: p.canChangeQuantity,
                        price: p.product.price,
                    }
                )
            })

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

            <Configuration>
                {product.items
                    ?.map(({ id, label, required, type, options }: any, index: number) => ({
                        _id: id,
                        type,
                        swatches: {
                            label,
                            name: `items[0].bundle_options[${index}].value`,
                            rules: { required },
                            items: options, //options.sort((a: any, b: any) => b.position - a.position),
                        },
                    }))
                    .sort((a: any, b: any) => b.position - a.position)
                    .map(({ _id, type, swatches }: any, index: number) => {
                        return (
                            <Fieldset key={_id || index}>
                                <Input name={`items[0].bundle_options[${index}].id`} type="hidden" value={_id} rules={{ required: true }} />

                                {/* Select List Field */}
                                {type === 'select' && (
                                    <React.Fragment>
                                        <Select
                                            hideError
                                            blankDefault={`Select an option...`}
                                            {...swatches}
                                            items={swatches.items.map(({ optionId: _id, defaultChecked, label, product }: any) => ({
                                                _id,
                                                defaultChecked,
                                                label: `${label} +${product.price.minimum.regular.value.toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: product.price.minimum.regular.currency,
                                                })}`,
                                                value: product.id,
                                            }))}
                                        />

                                        {selections[index] && (
                                            <PriceWrapper>
                                                <Price {...priceDataToProps(selections[index]?.price)} />

                                                <Quantity
                                                    key={selections[index]?.canChangeQuantity ? 1 : 0}
                                                    name={`items[0].bundle_options[${index}].quantity`}
                                                    hideError
                                                    rules={{ required: true }}
                                                    disabled={!selections[index]?.canChangeQuantity}
                                                    defaultValue={selections[index]?.quantity}
                                                />
                                            </PriceWrapper>
                                        )}
                                    </React.Fragment>
                                )}

                                {/* Radio Field */}
                                {type === 'radio' && (
                                    <React.Fragment>
                                        <Checkbox
                                            hideError
                                            type="radio"
                                            {...swatches}
                                            items={swatches.items.map(({ optionId: _id, defaultChecked, label, product }: any) => ({
                                                _id,
                                                defaultChecked,
                                                label: (
                                                    <OptionLabel>
                                                        {label}
                                                        <PriceWrapper>
                                                            +
                                                            {product.price.minimum.regular.value.toLocaleString('en-US', {
                                                                style: 'currency',
                                                                currency: product.price.minimum.regular.currency,
                                                            })}
                                                        </PriceWrapper>
                                                    </OptionLabel>
                                                ),
                                                value: product.id,
                                            }))}
                                        />

                                        {selections[index] && (
                                            <PriceWrapper>
                                                <Price {...priceDataToProps(selections[index]?.price)} />

                                                <Quantity
                                                    key={selections[index]?.canChangeQuantity ? 1 : 0}
                                                    name={`items[0].bundle_options[${index}].quantity`}
                                                    hideError
                                                    rules={{ required: true }}
                                                    disabled={!selections[index]?.canChangeQuantity}
                                                    defaultValue={selections[index]?.quantity}
                                                />
                                            </PriceWrapper>
                                        )}
                                    </React.Fragment>
                                )}

                                {/* Multi Select Field */}
                                {type === 'multi' && (
                                    <React.Fragment>
                                        <TextSwatches
                                            hideError
                                            type="checkbox"
                                            {...swatches}
                                            items={swatches.items.map(({ optionId: _id, defaultChecked, label, product, quantity }: any) => ({
                                                _id,
                                                defaultChecked,
                                                label: (
                                                    <OptionLabel>
                                                        {quantity} × {label}
                                                        <PriceWrapper>
                                                            +
                                                            {(product.price.minimum.regular.value * quantity).toLocaleString('en-US', {
                                                                style: 'currency',
                                                                currency: product.price.minimum.regular.currency,
                                                            })}
                                                        </PriceWrapper>
                                                    </OptionLabel>
                                                ),
                                                value: product.id,
                                            }))}
                                        />

                                        {/* <Input name={`items[0].bundle_options[${index}].quantity`} type="hidden" value={_id} rules={{ required: true }} /> */}
                                    </React.Fragment>
                                )}

                                {/* Checkbox Field */}
                                {type === 'checkbox' && (
                                    <Checkbox
                                        hideError
                                        {...swatches}
                                        items={swatches.items.map(({ optionId: _id, defaultChecked, label, product, quantity }: any) => ({
                                            _id,
                                            defaultChecked,
                                            label: (
                                                <OptionLabel>
                                                    {quantity} × {label}
                                                    <PriceWrapper>
                                                        +
                                                        {(product.price.minimum.regular.value * quantity).toLocaleString('en-US', {
                                                            style: 'currency',
                                                            currency: product.price.minimum.regular.currency,
                                                        })}
                                                    </PriceWrapper>
                                                </OptionLabel>
                                            ),
                                            value: product.id,
                                        }))}
                                    />
                                )}
                            </Fieldset>
                        )
                    })}
            </Configuration>

            <Quantity name="items[0].data.quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError />

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={false} />

            {error && <Error>{error}</Error>}
        </Root>
    )
}
