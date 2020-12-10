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

const SelectOptions = ({ swatches, selected, index }: any) => {
    const defaultValue = swatches.items.find((x: any) => !!x.defaultChecked)?.product.id

    const items = swatches.items
        .map(({ optionId: _id, label, product }: any) => ({
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
            <Select hideError blankDefault={`Select an option...`} {...swatches} items={items} defaultValue={defaultValue} />

            <PriceWrapper $active={!!selected}>
                <Quantity
                    key={selected?.id}
                    name={`items[0].bundle_options[${index}].quantity`}
                    rules={{ required: true }}
                    disabled={!selected?.canChangeQuantity}
                    defaultValue={selected?.quantity}
                    hideError
                />
            </PriceWrapper>

            {!selected?.canChangeQuantity && <Input name={`items[0].bundle_options[${index}].quantity`} type="hidden" value={selected?.quantity} />}
        </React.Fragment>
    )
}

const RadioOptions = ({ swatches, selected, index }: any) => {
    const items = swatches.items.map(({ optionId: _id, defaultChecked, label, product }: any) => ({
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
            <Checkbox hideError type="radio" {...swatches} items={items} />

            <PriceWrapper $active={!!selected}>
                <Quantity
                    key={selected?.id}
                    name={`items[0].bundle_options[${index}].quantity`}
                    rules={{ required: true }}
                    disabled={!selected?.canChangeQuantity}
                    defaultValue={selected?.quantity}
                    hideError
                />

                {!selected?.canChangeQuantity && <Input name={`items[0].bundle_options[${index}].quantity`} type="hidden" value={selected?.quantity} />}
            </PriceWrapper>
        </React.Fragment>
    )
}

const MultiOptions = ({ swatches, index, selected = [] }: any) => {
    const items = swatches.items.map(({ optionId: _id, defaultChecked, label, product, quantity }: any) => ({
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
        value: product.id,
    }))

    return (
        <React.Fragment>
            <TextSwatches hideError type="checkbox" {...swatches} items={items} />

            {selected.map((s: any, sI: number) => (
                <Input key={sI} name={`items[0].bundle_options[${index}].quantity[${sI}]`} type="hidden" value={s.quantity} />
            ))}
        </React.Fragment>
    )
}

const CheckboxOptions = ({ swatches, index, selected = [] }: any) => {
    const items = swatches.items.map(({ optionId: _id, defaultChecked, label, product, quantity }: any) => ({
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
        value: product.id,
    }))

    return (
        <React.Fragment>
            <Checkbox hideError {...swatches} items={items} />

            {selected.map((s: any, sI: number) => (
                <Input key={sI} name={`items[0].bundle_options[${index}].quantity[${sI}]`} type="hidden" value={s.quantity} />
            ))}
        </React.Fragment>
    )
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

    // const [selections, setSelections] = useState<[{ id: string; hideQuantityField: boolean; quantity: number; canChangeQuantity: boolean; price: number }?]>([])

    const [selectedOptions, setSelectedOptions] = useState<{ [id: number]: any } | { [id: number]: any }[]>({})

    // const [total, setTotal] = useState(0)

    const history = useRouter()

    const handleOnValues = useCallback(
        ({ items }) => {
            const _selectedOptions: any = {}

            items[0].bundle_options.forEach((option: any, optionIndex: number) => {
                const id = Number(option.id)
                const values = typeof option.value === 'string' ? [option.value] : option.value

                if (typeof option.value === 'string') {
                    const productId = Number(values)
                    _selectedOptions[id] = product.items[optionIndex].options.find((y: any) => y.product.id === productId)
                } else {
                    values.forEach((value: string) => {
                        const productId = Number(value)
                        _selectedOptions[id] = [...(_selectedOptions[id] ?? []), product.items[optionIndex].options.find((y: any) => y.product.id === productId)]
                    })
                }
            })

            setSelectedOptions(_selectedOptions)
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
        <Root as={Form} onSubmit={handleAddToCart} onInit={handleOnValues} onValues={handleOnValues}>
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
                            items: options,
                        },
                    }))
                    .sort((a: any, b: any) => b.position - a.position)
                    .map(({ _id, type, swatches }: any, index: number) => {
                        return (
                            <Fieldset key={_id || index}>
                                <Input name={`items[0].bundle_options[${index}].id`} type="hidden" value={_id} rules={{ required: true }} />

                                {/* Select List Field */}
                                {type === 'select' && <SelectOptions index={index} swatches={swatches} selected={selectedOptions[_id]} />}

                                {/* Radio Field */}
                                {type === 'radio' && <RadioOptions index={index} swatches={swatches} selected={selectedOptions[_id]} />}

                                {/* Multi Select Field */}
                                {type === 'multi' && <MultiOptions index={index} swatches={swatches} selected={selectedOptions[_id]} />}

                                {/* Checkbox Field */}
                                {type === 'checkbox' && <CheckboxOptions index={index} swatches={swatches} selected={selectedOptions[_id]} />}
                            </Fieldset>
                        )
                    })}
            </Configuration>

            {'total'}

            <Quantity name="items[0].data.quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError />

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={false} />

            {error && <Error>{error}</Error>}
        </Root>
    )
}
