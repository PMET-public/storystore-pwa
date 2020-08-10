import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import dynamic from 'next/dynamic'
import ProductList from '@storystore/ui/dist/components/ProductList'
import { ProductCarouselProps } from '@storystore/ui/dist/components/ProductCarousel'
import Link from '~/components/Link'
import { resolveImage } from '~/lib/resolveImage'
import { useQuery } from '@apollo/client'
import { PRODUCTS_QUERY } from '.'

const ProductCarousel = dynamic(() => import('@storystore/ui/dist/components/ProductCarousel'), { ssr: false })

export type ProductsProps = {
    appearance?: 'grid' | 'carousel'
    skus: string[]
    slider?: ProductCarouselProps
}

export const Products: Component<ProductsProps> = ({ appearance = 'grid', skus, slider, ...props }) => {
    const { data, loading } = useQuery(PRODUCTS_QUERY, {
        variables: { skus, pageSize: skus.length },
    })

    const productUrlSuffix = data?.store?.productUrlSuffix ?? ''

    if (appearance === 'carousel') {
        return (
            <ProductCarousel
                loading={loading && !data?.products?.items}
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
                loading={loading && !data?.products?.items}
                items={data?.products?.items?.map(({ title, urlKey, image, options, price }: any) => ({
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
                {...props}
            />
        )
    }

    return null
}
