import React, { FunctionComponent, useCallback, useState, useRef, useContext } from 'react'
import { Root } from './ConfigurableProduct.styled'
import Form, { TextSwatchesProps, TextSwatches, Select, Quantity } from '@storystore/ui/dist/components/Form'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Button from '@storystore/ui/dist/components/Button'
import ColorSwatches, { ColorSwatchesProps } from '@storystore/ui/dist/components/Form/ColorSwatches'
import ThumbSwatches, { ThumbSwatchesProps } from '@storystore/ui/dist/components/Form/ThumbSwatches'
import { resolveImage } from '~/lib/resolveImage'
import { ProductContext } from '~/components/Product'

export type ConfigurableProductProps = {
    sku: string
    variantSku: string
    options: Array<{
        id: string | number
        label: string
        required: boolean
        code: string
        items: Array<{
            id: string | number
            label: string
            value: string
            swatch: TextSwatchesProps | ColorSwatchesProps | ThumbSwatchesProps
        }>
    }>
    variants: Array<{
        code: string
        value: number
    }>
    inStock?: boolean
}

export const ConfigurableProduct: FunctionComponent<ConfigurableProductProps> = ({ sku, variantSku, options, variants, inStock = true }) => {
    const { cartId } = useStoryStore()

    const { addConfigurableProductToCart, addingConfigurableProductToCart } = useCart({ cartId })

    const history = useRouter()

    const formRef = useRef<HTMLDivElement>(null)

    const [selectedOptions, setSelectedOptions] = useState<{ [code: string]: string }>({})

    const { setSelectedVariantIndex } = useContext(ProductContext)

    const handleOnChange = useCallback(
        (values: { options: { [key: string]: string } }) => {
            const { options } = values
            debugger
            setSelectedOptions(options)

            const variantIndex = variants.findIndex((variant: any) => {
                return Object.entries(options)
                    .filter(([_, value]) => value !== '')
                    .reduce((prev, [code, value]) => prev && variant[code] === Number(value), true)
            })

            setSelectedVariantIndex(variantIndex)
        },
        [variants, setSelectedVariantIndex]
    )

    const handleOnErrors = useCallback(() => {
        if (formRef.current && formRef.current.scrollTop > window.scrollY) {
            formRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [formRef])

    const handleAddToCart = useCallback(
        async ({ quantity = 1 }) => {
            if (!cartId || !inStock || addingConfigurableProductToCart.loading) return

            await addConfigurableProductToCart({ sku, variantSku, quantity })

            await history.push('/cart')

            window.scrollTo(0, 0)
        },
        [sku, variantSku, addConfigurableProductToCart, inStock, addingConfigurableProductToCart, history, cartId]
    )

    return (
        <div ref={formRef}>
            <Root as={Form} onSubmit={handleAddToCart} onValues={handleOnChange} onErrors={handleOnErrors} options={{ criteriaMode: 'firstError', shouldFocusError: true }}>
                {options
                    .map(({ id, label, required = true, code, items }: any) => {
                        const selected = items.find((x: any) => {
                            return code === x.code || x.value.toString() === selectedOptions[code]
                        })

                        return {
                            _id: id,
                            type: items[0]?.swatch?.__typename,
                            swatches: {
                                label: selected ? `${label}: ${selected.label}` : label,
                                name: `options.${code}`,
                                rules: { required },
                                items: items?.map(({ id, label, value, swatch }: any) => {
                                    return {
                                        _id: id,
                                        label,
                                        type: 'radio',
                                        value,
                                        color: swatch?.color,
                                        image: swatch?.image && {
                                            alt: label || '',
                                            src: resolveImage(swatch.image, { width: 400 }),
                                            sources: [
                                                <source key="webp" type="image/webp" srcSet={resolveImage(swatch.image, { width: 400, type: 'webp' })} />,
                                                <source key="original" srcSet={resolveImage(swatch.image, { width: 400 })} />,
                                            ],
                                            width: 160,
                                            height: 198,
                                        },
                                    }
                                }),
                            },
                        }
                    })
                    .sort((a: any, b: any) => b.position - a.position)
                    .map(({ _id, type, swatches }: any, index: number) => {
                        return (
                            <fieldset key={_id || index}>
                                {type === 'TextSwatchData' && <TextSwatches hideError {...swatches} />}
                                {type === 'ImageSwatchData' && <ThumbSwatches hideError {...swatches} />}
                                {type === 'ColorSwatchData' && <ColorSwatches hideError {...swatches} />}
                                {type === undefined && <Select hideError blankDefault={`Choose an option...`} {...swatches} />}
                            </fieldset>
                        )
                    })}

                <Quantity name="quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError />

                <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingConfigurableProductToCart.loading} />
            </Root>
        </div>
    )
}
