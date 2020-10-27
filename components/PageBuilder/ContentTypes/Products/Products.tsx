import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import { ProductCarouselProps } from '~/components/ProductCarousel'
import ProductsComponent from '~/components/Products'
export type ProductsProps = {
    appearance?: 'grid' | 'carousel'
    skus: string[]
    slider?: ProductCarouselProps
}

export const Products: Component<ProductsProps> = ({ appearance = 'grid', skus, ...props }) => {
    return <ProductsComponent type={appearance} filters={{ sku: { in: skus } }} pageSize={skus.length} {...props} />
}
