import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import ProductList from '@storystore/ui/dist/components/ProductList'
import ProductCarousel, { ProductCarouselProps } from '@storystore/ui/dist/components/ProductCarousel'
import { useProducts } from './useProducts'
import Link from '../../../Link'
import { resolveImage } from '../../../../lib/resolveImage'

export type ProductsProps = {
    appearance?: 'grid' | 'carousel'
    skus: string[]
    slider?: ProductCarouselProps
}

export const Products: Component<ProductsProps> = ({ appearance = 'grid', skus, slider, ...props }) => {
    const { loading, data } = useProducts({ skus })

    const productUrlSuffix = data?.store?.productUrlSuffix ?? ''

    if (appearance === 'carousel') {
        return (
            <ProductCarousel
                loadingMore={loading && !data?.products?.items}
                items={data?.products?.items?.map(({ id, title, urlKey, image, price, options }: any) => ({
                    _id: id,
                    title: {
                        text: title,
                    },
                    as: Link,
                    href: `/${urlKey}${productUrlSuffix}`,
                    urlResolver: {
                        type: 'PRODUCT',
                        urlKey,
                    },
                    image: {
                        alt: image.alt,
                        src: {
                            desktop: resolveImage(image.src, { width: 1260 }),
                            mobile: resolveImage(image.src, { width: 960 }),
                        },
                    },
                    price: {
                        label: price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined,
                        regular: price.minimum.regular.value,
                        special: price.minimum.discount.amountOff && price.minimum.final.value - price.minimum.discount.amountOff,
                        currency: price.minimum.regular.currency,
                    },
                    colors: options
                        ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch.__typename === 'ColorSwatchData'))
                        ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                }))}
                {...slider}
                {...props}
            />
        )
    }

    if (appearance === 'grid') {
        return (
            <ProductList
                loadingMore={loading && !data?.products?.items}
                items={data?.products?.items?.map(({ id, title, urlKey, image, price }: any) => ({
                    _id: id,
                    title: {
                        text: title,
                    },
                    as: Link,
                    href: `/${urlKey}${productUrlSuffix}`,
                    urlResolver: {
                        type: 'PRODUCT',
                        urlKey,
                    },
                    image: {
                        alt: image.alt,
                        src: {
                            desktop: resolveImage(image.src, { width: 1260 }),
                            mobile: resolveImage(image.src, { width: 960 }),
                        },
                    },
                    price: {
                        label: price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined,
                        regular: price.minimum.regular.value,
                        special: price.minimum.discount.amountOff && price.minimum.final.value - price.minimum.discount.amountOff,
                        currency: price.minimum.regular.currency,
                    },
                }))}
                {...props}
            />
        )
    }

    return null
}
