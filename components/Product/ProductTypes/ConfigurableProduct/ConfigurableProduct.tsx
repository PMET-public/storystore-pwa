import React, { FunctionComponent, useCallback, useState, useRef } from 'react'
import { Root } from './ConfigurableProduct.styled'
import { useQuery } from '@apollo/client'
import { CONFIGURABLE_PRODUCT_QUERY } from '.'
import Form, { TextSwatches, Select, Quantity, Error } from '@storystore/ui/dist/components/Form'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Button from '@storystore/ui/dist/components/Button'
import ColorSwatches from '@storystore/ui/dist/components/Form/ColorSwatches'
import ThumbSwatches from '@storystore/ui/dist/components/Form/ThumbSwatches'
import { resolveImage } from '~/lib/resolveImage'
import { useProductLayout, priceDataToProps, ProductGallery } from '~/components/Product'
import { ConfigurableProductSkeleton } from './ConfigurableProduct.skeleton'

export type ConfigurableProductProps = {
    sku: string
    stock?: 'IN_STOCK' | 'OUT_OF_STOCK'
    urlKey: string
    gallery: ProductGallery
}

export const ConfigurableProduct: FunctionComponent<ConfigurableProductProps> = ({ sku, stock, gallery, urlKey }) => {
    const { loading, data } = useQuery(CONFIGURABLE_PRODUCT_QUERY, {
        variables: { filters: { url_key: { eq: urlKey } } },
        fetchPolicy: 'cache-and-network',
    })

    const product = data?.products?.items[0]

    const { cartId } = useStoryStore()

    const { addConfigurableProductToCart, addingConfigurableProductToCart } = useCart({ cartId })

    const history = useRouter()

    const formRef = useRef<HTMLDivElement>(null)

    const [selectedOptions, setSelectedOptions] = useState<{ [code: string]: string }>({})

    const [variantSku, setVariantSku] = useState(sku)

    const inStock = (stock ?? 'IN_STOCK') === 'IN_STOCK'

    const [error, setError] = useState<string | null>(null)

    const { setGallery, setPrice } = useProductLayout()

    const variantsIndexes = product?.variants?.reduce((accumVariants: any[], current: any) => {
        return [
            ...accumVariants,
            current.attributes.reduce((accumAttributes: any, currentAttribute: any) => {
                const { code, value } = currentAttribute
                return { ...accumAttributes, [code]: value }
            }, {}),
        ]
    }, [])

    const handleOnChange = useCallback(
        (values: { options: { [key: string]: string } }) => {
            const { options } = values

            setSelectedOptions(options)

            // Find combination of options selected in Variants
            const variantIndex = variantsIndexes.findIndex((variant: any) => {
                return Object.entries(options)
                    .filter(([_, value]) => value !== '')
                    .reduce((prev, [code, value]) => prev && variant[code] === Number(value), true)
            })

            // If Variant is found...
            if (variantIndex > -1) {
                // ...get product variant's product data...
                const _variant = product.variants[variantIndex].product

                // ...get image gallery...
                let variantGallery = [..._variant.gallery]

                // ...if the gallery only has one image, then only swap the first one so we can still see other angles shots, etc...
                if (_variant.gallery.length === 1 && gallery.length > 1) {
                    variantGallery = [...variantGallery, ...[...gallery].splice(1)]
                }

                setGallery(variantGallery)

                // ...variant's price...
                const price = priceDataToProps(_variant.price)

                setVariantSku(_variant.variantSku)

                if (price) setPrice(price)
            }
        },
        [gallery, product, setGallery, setPrice, variantsIndexes]
    )

    const handleOnErrors = useCallback(() => {
        if (formRef.current && formRef.current.scrollTop > window.scrollY) {
            formRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [formRef])

    const handleAddToCart = useCallback(
        async ({ quantity = 1 }) => {
            if (!cartId || !inStock || addingConfigurableProductToCart.loading) return

            try {
                setError(null)
                await addConfigurableProductToCart({ sku: sku, variantSku, quantity })
                await history.push('/cart')

                window.scrollTo(0, 0)
            } catch (e) {
                setError(e.message)
            }
        },
        [cartId, inStock, addingConfigurableProductToCart.loading, addConfigurableProductToCart, sku, variantSku, history]
    )

    /**
     * Skeleton Loader
     */
    if (loading && !product) return <ConfigurableProductSkeleton />

    if (!product) return null

    return (
        <div ref={formRef}>
            <Root as={Form} onSubmit={handleAddToCart} onValues={handleOnChange} onErrors={handleOnErrors} options={{ criteriaMode: 'firstError', shouldFocusError: true }}>
                {product?.options
                    ?.map(({ id, label, required = true, code, items }: any) => {
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
                                {type === undefined && <Select hideError blankLabel={`Select an option...`} {...swatches} />}
                            </fieldset>
                        )
                    })}

                <Quantity name="quantity" defaultValue={1} minValue={1} addLabel="Add" removeLabel="Remove" rules={{ required: true, min: 1 }} hideError />

                <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingConfigurableProductToCart.loading} />

                {error && <Error>{error}</Error>}
            </Root>
        </div>
    )
}
