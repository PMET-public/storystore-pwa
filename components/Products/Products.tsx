import React, { FunctionComponent, useState, useRef } from 'react'
import { resolveImage } from '~/lib/resolveImage'
import { Root, Wrapper, ProductListWrapper } from './Products.styled'
import Link from '~/components/Link'
import { QueryResult } from '@apollo/client'
import ProductList from '@storystore/ui/dist/components/ProductList'
import { useFetchMoreOnScrolling } from '@storystore/ui/dist/hooks/useFetchMoreOnScrolling'

export const Products: FunctionComponent<QueryResult> = ({ data, loading, fetchMore }) => {
    const [fetchingMore, setFetchingMore] = useState(false)

    const { pagination, items } = data?.products ?? {}

    const productUrlSuffix = data?.store?.productUrlSuffix || ''

    /**
     * Infinite Scroll
     */
    const productListRef = useRef<HTMLDivElement>(null)

    useFetchMoreOnScrolling(
        () => {
            setFetchingMore(true)

            fetchMore({
                variables: {
                    currentPage: pagination.current + 1, // next page
                },
                updateQuery: (prev: any, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev
                    return {
                        ...prev,
                        products: {
                            ...prev.products,
                            ...fetchMoreResult.products,
                            items: [...prev.products.items, ...fetchMoreResult.products.items],
                        },
                    }
                },
            })
                .catch(() => {})
                .then(() => {
                    setFetchingMore(false)
                })
        },
        {
            disabled: loading || fetchingMore || !(pagination && pagination.current < pagination.total),
            threshold: 400,
            contentRef: productListRef,
        }
    )

    return (
        <Root>
            <Wrapper>
                <ProductListWrapper $margin ref={productListRef}>
                    <ProductList
                        loading={loading}
                        loadingMore={loading || fetchingMore}
                        items={items
                            ?.filter((x: any) => x !== null) // patches results returning nulls. I'm looking at you Gift Cards
                            .map(({ id, image, price, title, urlKey, options }: any, index: number) => ({
                                lazy: index > 0,
                                _id: `${id}--${index}`,
                                as: Link,
                                href: `/${urlKey + productUrlSuffix}`,
                                urlResolver: {
                                    type: 'PRODUCT',
                                    id,
                                    urlKey,
                                },
                                image: {
                                    alt: image.alt,
                                    src: resolveImage(image.src, { width: 960, height: 960 }),
                                    sources: [
                                        <source key="mobile-webp" type="image/webp" media="(max-width: 991px)" srcSet={resolveImage(image.src, { width: 960, height: 960, type: 'webp' })} />,
                                        <source key="mobile" media="(max-width: 991px)" srcSet={resolveImage(image.src, { width: 960, height: 960 })} />,
                                        <source key="desktop-webp" type="image/webp" media="(min-width: 992px)" srcSet={resolveImage(image.src, { width: 1260, height: 1260, type: 'webp' })} />,
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
                                title: {
                                    text: title,
                                },
                                colors: options
                                    ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch?.__typename === 'ColorSwatchData'))
                                    ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                            }))}
                    />
                </ProductListWrapper>
            </Wrapper>
        </Root>
    )
}
