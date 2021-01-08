import React, { FunctionComponent, useCallback, useState } from 'react'
import { BUNDLE_PRODUCT_QUERY } from '.'
import { Root, Configuration, Fieldset, OptionLabel, PriceWrapper } from './BundleProduct.styled'
import Form, { Input, Error, TextSwatches, Select, Checkbox, Quantity } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import Price from '@storystore/ui/dist/components/Price'

export type BundleProductProps = {
    sku: string
    inStock?: boolean
    urlKey: string
}

const SelectOptions = ({ swatches: _swatches, selected: _selected = [] }: any) => {
    const [selected] = _selected

    const { index, _id, ...swatches } = _swatches

    const defaultValue = swatches.items.find((x: any) => !!x.defaultChecked)?.product.id

    const items = swatches.items
        .map(({ id: _id, label, product }: any) => ({
            _id,
            label: `${label} +${product.price.minimum.regular.value.toLocaleString('en-US', {
                style: 'currency',
                currency: product.price.minimum.regular.currency,
            })}`,
            value: product.id,
        }))
        .sort((a: any, b: any) => b.position - a.position)

    return (
        <React.Fragment>
            <Input name={`selections[${index}].id`} type="hidden" value={_id} rules={{ required: true, valueAsNumber: true }} />

            <Select {...swatches} hideError blankLabel={`Select an option...`} name={`selections[${index}].value`} items={items} defaultValue={defaultValue} />

            <PriceWrapper $active={!!selected}>
                <Quantity
                    key={selected?.id}
                    name={`selections[${index}].quantity`}
                    rules={{ required: true, valueAsNumber: true }}
                    readOnly={!selected?.canChangeQuantity}
                    defaultValue={selected?.quantity}
                    hideError
                />
            </PriceWrapper>
        </React.Fragment>
    )
}

const RadioOptions = ({ swatches, selected: _selected = [] }: any) => {
    const [selected] = _selected

    const { index, _id } = swatches

    const items = swatches.items.map(({ id: _id, defaultChecked, label, product }: any) => ({
        _id,
        defaultChecked,
        label: (
            <OptionLabel>
                {label}
                <PriceWrapper $active>
                    +
                    {product.price.minimum.regular.value.toLocaleString('en-US', {
                        style: 'currency',
                        currency: product.price.minimum.regular.currency,
                    })}
                </PriceWrapper>
            </OptionLabel>
        ),
        value: product.id,
    }))

    return (
        <React.Fragment>
            <Input name={`selections[${index}].id`} type="hidden" value={_id} rules={{ required: true, valueAsNumber: true }} />

            <Checkbox hideError type="radio" {...swatches} name={`selections[${index}].value`} items={items} />

            <PriceWrapper $active={!!selected}>
                <Quantity
                    key={selected?.id}
                    name={`selections[${index}].quantity`}
                    rules={{ required: true, valueAsNumber: true }}
                    readOnly={!selected?.canChangeQuantity}
                    defaultValue={selected?.quantity}
                    hideError
                />
            </PriceWrapper>
        </React.Fragment>
    )
}

const MultiOptions = ({ swatches }: any) => {
    const { index } = swatches

    const items = swatches.items.map(({ id: _id, defaultChecked, label, product, quantity }: any) => ({
        _id,
        defaultChecked,
        label: (
            <OptionLabel>
                {quantity} × {label}
                <PriceWrapper $active>
                    +
                    {(product.price.minimum.regular.value * quantity).toLocaleString('en-US', {
                        style: 'currency',
                        currency: product.price.minimum.regular.currency,
                    })}
                </PriceWrapper>
            </OptionLabel>
        ),
        value: JSON.stringify({ id: _id, value: product.id.toString(), quantity }),
    }))

    return <TextSwatches hideError type="checkbox" {...swatches} name={`selections[${index}]`} items={items} />
}

const CheckboxOptions = ({ swatches }: any) => {
    const { index } = swatches

    const items = swatches.items.map(({ id: _id, defaultChecked, label, product, quantity }: any) => ({
        _id,
        defaultChecked,
        label: (
            <OptionLabel>
                {quantity} × {label}
                <PriceWrapper $active>
                    +
                    {(product.price.minimum.regular.value * quantity).toLocaleString('en-US', {
                        style: 'currency',
                        currency: product.price.minimum.regular.currency,
                    })}
                </PriceWrapper>
            </OptionLabel>
        ),
        value: JSON.stringify({ id: _id, value: product.id.toString(), quantity }),
    }))

    return <Checkbox hideError {...swatches} name={`selections[${index}]`} items={items} />
}

export const BundleProduct: FunctionComponent<BundleProductProps> = ({ sku, urlKey, inStock = true }) => {
    const { loading, data } = useQuery(BUNDLE_PRODUCT_QUERY, {
        variables: { filters: { url_key: { eq: urlKey } } },
        fetchPolicy: 'cache-and-network',
    })

    const product = data?.products?.items[0]

    const { cartId } = useStoryStore()

    const { addProductsToCart, addingProductsToCart } = useCart({ cartId })

    const [error, setError] = useState<string | null>(null)

    const [selectedOptions, setSelectedOptions] = useState<{ [id: number]: any } | { [id: number]: any }[]>({})

    const [total, setTotal] = useState(0)

    const history = useRouter()

    const handleOnValues = useCallback(
        ({ selections = [] }) => {
            console.log('handleOnValues', selections)

            const _selectedOptions: any = {}
            let _total = 0

            selections.forEach((option: any, optionIndex: number) => {
                if (!option.value) return

                const id = Number(option.id)
                const productId = Number(option.value)
                const _option = product.items[optionIndex].options.find((y: any) => y.product.id === productId)

                _selectedOptions[id] = [...(_selectedOptions[id] ?? []), _option]
                _total += _option.product.price.minimum.regular.value * _option.quantity
            })

            setTotal(_total)
            setSelectedOptions(_selectedOptions)
        },
        [product]
    )

    const handleAddToCart = useCallback(
        async ({ cart_items, selections = [] }) => {
            if (!cartId || !inStock || addingProductsToCart.loading) return

            cart_items[0].bundle_options = selections.reduce((result: any, item: any) => {
                if (item.id) return [...result, item]
                else return [...result, ...item.map((x: string) => JSON.parse(x))]
            }, [])

            console.log('handleAddToCart', { cart_items })
            return

            try {
                setError(null)

                await addProductsToCart(cart_items)

                await history.push('/cart')

                window.scrollTo(0, 0)
            } catch (e) {
                setError(e.message)
            }
        },
        [addProductsToCart, inStock, addingProductsToCart, history, cartId]
    )

    if (loading && !product) return <>⏲ Loading...</>

    return (
        <Root as={Form} onSubmit={handleAddToCart} onValues={handleOnValues}>
            <Input name="cart_items[0].data.sku" type="hidden" value={sku} rules={{ required: true }} />

            <Configuration>
                {product.items
                    ?.map(({ id, label, required, type, options }: any, index: number) => ({
                        _id: id,
                        type,
                        swatches: {
                            _id: id,
                            index,
                            label,
                            rules: { required },
                            items: options,
                        },
                    }))
                    .sort((a: any, b: any) => b.position - a.position)
                    .map(({ _id, type, swatches }: any, index: number) => {
                        return (
                            <Fieldset key={_id || index}>
                                {/* Select List Field */}
                                {type === 'select' && <SelectOptions swatches={swatches} selected={selectedOptions[_id]} />}

                                {/* Radio Field */}
                                {type === 'radio' && <RadioOptions swatches={swatches} selected={selectedOptions[_id]} />}

                                {/* Multi Select Field */}
                                {type === 'multi' && <MultiOptions swatches={swatches} />}

                                {/* Checkbox Field */}
                                {type === 'checkbox' && <CheckboxOptions swatches={swatches} />}
                            </Fieldset>
                        )
                    })}
            </Configuration>

            <Price loading={loading} currency={product.price.minimum.regular.currency} regular={total} />

            <Quantity name="cart_items[0].data.quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1, valueAsNumber: true }} hideError />

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={false} />

            {error && <Error>{error}</Error>}
        </Root>
    )
}
