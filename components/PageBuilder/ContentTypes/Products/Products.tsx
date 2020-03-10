import React from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import ProductList from '@pmet-public/luma-ui/dist/components/ProductList'
import ProductCarousel from '@pmet-public/luma-ui/dist/components/ProductCarousel'
import { useProducts } from './useProducts'
import Link from '../../../Link'
import { resolveImage } from '../../../../lib/resolveImage'

export type ProductsCarousel = {
    autoplay?: boolean
    autoplaySpeed?: number
    infinite?: boolean
    arrows?: boolean
    dots?: boolean
    carouselMode?: string | null
    centerPadding?: string | null
}

export type ProductsProps = {
    appearance?: 'grid' | 'carousel'
    skus: string[]
    carousel?: ProductsCarousel
}

export const Products: Component<ProductsProps> = ({ appearance = 'grid', skus, carousel, style, ...props }) => {
    const { loading, data } = useProducts({ skus })

    if (appearance === 'carousel') {
        return (
            <ProductCarousel
                loadingMore={loading && !data?.products?.items}
                items={data?.products?.items?.map(({ id, title, urlKey, image, price }: any) => ({
                    _id: id,
                    title: {
                        text: title,
                    },
                    as: Link,
                    href: `/${urlKey}`,
                    urlResolver: {
                        type: 'PRODUCT',
                        id,
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
                        special:
                            price.minimum.discount.amountOff &&
                            price.minimum.final.value - price.minimum.discount.amountOff,
                        currency: price.minimum.regular.currency,
                    },
                }))}
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
                    href: `/${urlKey}`,
                    urlResolver: {
                        type: 'PRODUCT',
                        id,
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
                        special:
                            price.minimum.discount.amountOff &&
                            price.minimum.final.value - price.minimum.discount.amountOff,
                        currency: price.minimum.regular.currency,
                    },
                }))}
                {...props}
            />
        )
    }

    return null
}
