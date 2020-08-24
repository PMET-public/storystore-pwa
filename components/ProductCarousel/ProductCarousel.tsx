import React from 'react'
import { Root } from './ProductCarousel.styled'
import { Component } from '@storystore/ui/dist/lib'
import { ProductItemSkeleton } from '@storystore/ui/dist/components/ProductItem/ProductItem.skeleton'
import SlickSlider, { SlickSliderProps } from '~/components/SlickSlider'
import ProductItem, { ProductItemProps } from '@storystore/ui/dist/components/ProductItem'

export type ProductCarouselProps = {
    loading?: boolean
    items: Array<ProductItemProps & { _id: string | number }>
} & SlickSliderProps

export const ProductCarousel: Component<ProductCarouselProps> = ({
    loading = false,
    items = [],
    accessibility = true,
    arrows = true,
    dots = true,
    speed = 400,
    infinite = true,
    centerMode = true,
    variableWidth = false,
    ...props
}) => {
    return (
        <Root
            as={SlickSlider}
            dots={dots}
            respondTo="min"
            accessibility={accessibility}
            arrows={arrows}
            infinite={infinite}
            speed={speed}
            centerMode={centerMode}
            variableWidth={variableWidth}
            slidesToShow={4}
            slidestoScroll={1}
            responsive={[
                {
                    breakpoint: 1599,
                    settings: {
                        slidesToShow: 3,
                    },
                },
                {
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                    },
                },
                {
                    breakpoint: 599,
                    settings: {
                        slidesToShow: 1,
                    },
                },
            ]}
            {...props}
        >
            {loading
                ? Array(6)
                      .fill(null)
                      .map((_, key) => <ProductItemSkeleton key={`loading__${key}`} />)
                : items.map((item: any, index) => {
                      return (
                          <ProductItem
                              {...item}
                              key={`slide__${item._id ?? index}`}
                              image={{
                                  ...item.image,
                                  lazy: false,
                              }}
                          />
                      )
                  })}
        </Root>
    )
}
