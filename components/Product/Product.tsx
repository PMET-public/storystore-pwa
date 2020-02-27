import React, { FunctionComponent, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'

import { useProduct } from './useProduct'
import { useRouter } from 'next/router'
import useNetworkStatus from '../../hooks/useNetworkStatus'
import { resolveImage } from '../../lib/resolveImage'

import DocumentMetadata from '../DocumentMetadata'
import ProductTemplate from '@pmet-public/luma-ui/dist/templates/Product'

import Link from '../Link'

const Error = dynamic(() => import('../Error'))

export type ProductProps = {
    urlKey: string
}

type SelectedOptions = {
    [code: string]: string
}

export const Product: FunctionComponent<ProductProps> = ({ urlKey }) => {
    const { loading, addingToCart, data, api } = useProduct({ urlKey })

    const router = useRouter()

    const online = useNetworkStatus()

    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})

    const handleOnChange = useCallback(
        (values: { options: { [key: string]: string } }) => {
            const options = Object.entries(values.options).reduce((accum, option) => {
                return option[1]
                    ? {
                          ...accum,
                          [option[0]]: option[1],
                      }
                    : { ...accum }
            }, {})

            setSelectedOptions(options)

            api.selectVariant(options)
        },
        [api.selectVariant]
    )

    const handleAddToCart = useCallback(async () => {
        const { sku, variantSku } = data.product

        try {
            if (type === 'ConfigurableProduct') {
                await api.addConfigurableProductToCart({ sku, variantSku, quantity: 1 })
            } else if (type === 'SimpleProduct') {
                await api.addSimpleProductToCart({ sku, quantity: 1 })
            } else {
                throw 'Product type not supported'
            }
            await router.push('/cart').then(() => window.scrollTo(0, 0))
        } catch (error) {
            console.error(error)
        }
    }, [data.product?.sku, data.product?.variantSku])

    if (!online && !data?.product) return <Error type="Offline" />

    if (!loading && !data?.product) {
        return (
            <Error
                type="404"
                children="We're sorry, we coudn't find the product."
                button={{ text: 'Search', as: Link, href: '/search' }}
            />
        )
    }

    const { hasCart, product } = data

    const {
        categories,
        description,
        gallery,
        metaDescription,
        metaKeywords,
        metaTitle,
        options,
        price,
        shortDescription,
        sku,
        stock,
        title,
        type,
    } = product || {}

    if (type && type !== 'ConfigurableProduct' && type !== 'SimpleProduct') {
        return <Error type="500">Product type: {type} not supported.</Error>
    }

    return (
        <React.Fragment>
            {product && (
                <DocumentMetadata title={metaTitle || title} description={metaDescription} keywords={metaKeywords} />
            )}

            <ProductTemplate
                loading={loading && !product}
                onAddToCart={handleAddToCart}
                onChange={handleOnChange}
                title={{
                    text: title,
                }}
                sku={
                    sku && {
                        text: `SKU. ${sku}`,
                    }
                }
                categories={{
                    items: categories
                        ?.slice(0, 4) // limit to 3
                        .filter((x: any) => !!x.href)
                        .map(({ id, text, href }: any) => ({
                            _id: id,
                            as: Link,
                            urlResolver: {
                                type: 'CATEGORY',
                                id,
                            },
                            href: '/' + href,
                            text,
                        })),
                }}
                gallery={gallery
                    ?.filter((x: any) => x.type === 'ProductImage')
                    .map(({ label, url }: any) => ({
                        alt: label || title,
                        src: {
                            desktop: resolveImage(url),
                            mobile: resolveImage(url),
                        },
                    }))
                    .sort((a: any, b: any) => a.position - b.position)}
                price={
                    price && {
                        label: price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined,
                        regular: price.minimum.regular.value,
                        special:
                            price.minimum.discount.amountOff &&
                            price.minimum.final.value - price.minimum.discount.amountOff,
                        currency: price.minimum.regular.currency,
                    }
                }
                options={options
                    ?.map(({ id, type, label, required = true, code, items }: any) => {
                        const selected = items.find((x: any) => {
                            return code === x.code, x.value.toString() === selectedOptions[code]
                        })

                        return {
                            _id: id,
                            type,
                            swatches: {
                                label: selected ? `${label}: ${selected.label}` : label,
                                name: `options.${code}`,
                                rules: { required },
                                items: items?.map(({ id, label, value, image }: any) => ({
                                    _id: id,
                                    text: label,
                                    type: 'radio',
                                    value,
                                    image: image && {
                                        alt: image.label || '',
                                        src: resolveImage(image.url),
                                        width: 4,
                                        height: 5,
                                    },
                                })),
                            },
                        }
                    })
                    .sort((a: any, b: any) => b.position - a.position)}
                addToCartButton={{
                    as: 'button',
                    text: stock === 'IN_STOCK' ? 'Add to Cart' : 'Sold Out',
                    disabled: !hasCart || stock === 'OUT_OF_STOCK',
                    loading: addingToCart,
                }}
                shortDescription={shortDescription && shortDescription.html}
                description={description && description.html}
            />
        </React.Fragment>
    )
}
