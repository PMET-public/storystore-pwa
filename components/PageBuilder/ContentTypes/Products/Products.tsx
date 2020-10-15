import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import dynamic from 'next/dynamic'
import { ProductCarouselProps } from '~/components/ProductCarousel'
import Link from '~/components/Link'
import { resolveImage } from '~/lib/resolveImage'
import { useQuery } from '@apollo/client'
import { PRODUCTS_QUERY } from '.'

const ProductList = dynamic(() => import('@storystore/ui/dist/components/ProductList'))

const ProductCarousel = dynamic(() => import('~/components/ProductCarousel'))

export type ProductsProps = {
    appearance?: 'grid' | 'carousel'
    skus: string[]
    slider?: ProductCarouselProps
}

export const Products: Component<ProductsProps> = ({ appearance = 'grid', skus, slider, ...props }) => {
    const { data, loading } = useQuery(PRODUCTS_QUERY, {
        variables: { skus, pageSize: skus.length },
    })

    if (appearance === 'carousel') {
        return (
            <ProductCarousel
                loading={loading && !data?.products?.items}
                items={data?.products?.items?.map(({ id, title, urlKey, urlSuffix = '', image, price, options }: any) => ({
                    _id: id,
                    title: {
                        text: title,
                    },
                    as: Link,
                    href: `/${urlKey}${urlSuffix}`,
                    urlResolver: {
                        type: 'PRODUCT',
                        urlKey,
                    },
                    image: {
                        alt: image.alt,
                        src: resolveImage(image.src, { width: 960, height: 960 }),
                        sources: [
                            <source key="mobile-webp" type="image/webp" media="(max-width: 991px)" srcSet={resolveImage(image.src, { width: 960, height: 960, type: 'webp' })} />,
                            <source key="mobile" media="(max-width: 991px)" srcSet={resolveImage(image.src, { width: 960, height: 960 })} />,
                            <source key="desktop-webp" type="image/webp" media="(min-width: 992px)" srcSet={resolveImage(image.src, { width: 1260, type: 'webp' })} />,
                            <source key="desktop" media="(min-width: 992px)" srcSet={resolveImage(image.src, { width: 1260, height: 1260 })} />,
                        ],
                        width: 960,
                        height: 960,
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
                loading={loading && !data?.products?.items}
                items={data?.products?.items?.map(({ title, urlKey, urlSuffix = '', image, options, price }: any) => ({
                    title: {
                        text: title,
                    },
                    as: Link,
                    href: `/${urlKey}${urlSuffix}`,
                    urlResolver: {
                        type: 'PRODUCT',
                        urlKey,
                    },
                    image: {
                        alt: image.alt,
                        src: resolveImage(image.src, { width: 960, height: 960 }),
                        sources: [
                            <source key="mobile-webp" type="image/webp" media="(max-width: 991px)" srcSet={resolveImage(image.src, { width: 960, height: 960, type: 'webp' })} />,
                            <source key="mobile" media="(max-width: 991px)" srcSet={resolveImage(image.src, { width: 960, height: 960 })} />,
                            <source key="desktop-webp" type="image/webp" media="(min-width: 992px)" srcSet={resolveImage(image.src, { width: 1260, type: 'webp' })} />,
                            <source key="desktop" media="(min-width: 992px)" srcSet={resolveImage(image.src, { width: 1260, height: 1260 })} />,
                        ],
                        width: 960,
                        height: 960,
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
                {...props}
            />
        )
    }

    return null
}
