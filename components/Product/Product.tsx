import React, { FunctionComponent, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'

import { useProduct } from './useProduct'
import { useRouter } from 'next/router'
import useNetworkStatus from '../../hooks/useNetworkStatus'
import { resolveImage } from '../../lib/resolveImage'

import ProductTemplate from '@pmet-public/luma-ui/dist/templates/Product'

import Link from '../Link'
import Head from '../Head'

const ErrorComponent = dynamic(() => import('../Error'))

export type ProductProps = {
    urlKey: string
}

type SelectedOptions = {
    [code: string]: string
}

export const Product: FunctionComponent<ProductProps> = ({ urlKey }) => {
    const { loading, addingToCart, data, api } = useProduct({ urlKey })

    const history = useRouter()

    const online = useNetworkStatus()

    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})

    const { hasCart, product } = data

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
        [api]
    )

    const handleAddToCart = useCallback(async () => {
        if (!product) return

        const { type, sku, variantSku } = product

        try {
            if (type === 'ConfigurableProduct') {
                await api.addConfigurableProductToCart({ sku, variantSku, quantity: 1 })
            } else if (type === 'SimpleProduct') {
                await api.addSimpleProductToCart({ sku, quantity: 1 })
            } else {
                throw Error('Product type not supported')
            }

            history.push('/cart')
        } catch (error) {
            console.error(error)
        }
    }, [api, product, history])

    if (!online && !product) return <ErrorComponent type="Offline" />

    if (!loading && !product) {
        return (
            <ErrorComponent
                type="404"
                children="We're sorry, we coudn't find the product."
                button={{ text: 'Search', as: Link, href: '/search' }}
            />
        )
    }

    // Pending support of other Product Types
    if (product?.type && product.type !== 'ConfigurableProduct' && product.type !== 'SimpleProduct') {
        return <ErrorComponent type="500">Product type: {product.type} not supported.</ErrorComponent>
    }

    return (
        <React.Fragment>
            {product && (
                <Head
                    title={product.metaTitle || product.title}
                    description={product.metaDescription}
                    keywords={product.metaKeywords}
                />
            )}

            <ProductTemplate
                loading={loading && !product}
                onAddToCart={handleAddToCart}
                onChange={handleOnChange}
                title={{
                    text: product?.title,
                }}
                sku={
                    product?.sku && {
                        text: `SKU. ${product.sku}`,
                    }
                }
                categories={{
                    items: product?.categories
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
                gallery={product?.gallery
                    ?.filter((x: any) => x.type === 'ProductImage')
                    .map(({ label, url }: any) => ({
                        alt: label || product?.title,
                        src: {
                            desktop: resolveImage(url),
                            mobile: resolveImage(url),
                        },
                    }))
                    .sort((a: any, b: any) => a.position - b.position)}
                price={
                    product?.price && {
                        label:
                            product.price.maximum.regular.value > product.price.minimum.regular.value
                                ? 'Starting at'
                                : undefined,
                        regular: product.price.minimum.regular.value,
                        special:
                            product.price.minimum.discount.amountOff &&
                            product.price.minimum.final.value - product.price.minimum.discount.amountOff,
                        currency: product.price.minimum.regular.currency,
                    }
                }
                options={product?.options
                    ?.map(({ id, type, label, required = true, code, items }: any) => {
                        const selected = items.find((x: any) => {
                            return code === x.code || x.value.toString() === selectedOptions[code]
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
                    text: product?.stock === 'IN_STOCK' ? 'Add to Cart' : 'Sold Out',
                    disabled: !hasCart || product?.stock === 'OUT_OF_STOCK',
                    loading: addingToCart,
                }}
                shortDescription={product?.shortDescription && product?.shortDescription.html}
                description={product?.description && product?.description.html}
            />
        </React.Fragment>
    )
}
