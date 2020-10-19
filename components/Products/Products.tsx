import React, { FunctionComponent, useState, useRef, useCallback, useEffect } from 'react'
import { resolveImage } from '~/lib/resolveImage'
import { Root, Wrapper, ProductListWrapper } from './Products.styled'
import Link from '~/components/Link'
import { useQuery } from '@apollo/client'
import ProductList from '@storystore/ui/dist/components/ProductList'
import { useFetchMoreOnScrolling } from '@storystore/ui/dist/hooks/useFetchMoreOnScrolling'
import ProductCarousel from '~/components/ProductCarousel'
import { PRODUCTS_QUERY } from '.'
import { Filters, FilterVariables, FilterSelected } from '~/components/Filters'

export type ProductsProps = {
    loading?: boolean
    includeFilters?: boolean
    type?: 'grid' | 'carousel'
    openFilters?: boolean
    onToggleFilters?: (state: boolean) => any
    onUpdatedFilters?: (selections: any) => any
    onResults?: (data: any) => any
    onLoading?: (state: boolean) => any
    search?: string
    filters?: any
    sort?: any
    pageSize?: number
    currentPage?: number
}

export const Products: FunctionComponent<ProductsProps> = ({
    loading: _loading,
    search,
    filters: _filters,
    sort,
    includeFilters = true,
    openFilters,
    onToggleFilters = () => {},
    onUpdatedFilters = () => {},
    onResults = () => {},
    onLoading = () => {},
    type = 'grid',
    pageSize,
    currentPage,
}) => {
    /**
     * Filters
     */

    const [filters, setFilters] = useState<{ selected: FilterSelected; variables: FilterVariables }>({ selected: {}, variables: {} })

    const handleOnFiltersUpdate = useCallback(
        ({ selected, variables }) => {
            setFilters({ selected, variables })

            onUpdatedFilters(Object.keys(selected).length > 0 ? selected : null)
        },
        [onUpdatedFilters]
    )

    const { data, loading, fetchMore } = useQuery(PRODUCTS_QUERY, {
        variables: { search, filters: { ..._filters, ...filters.variables }, sort, pageSize, currentPage },
        fetchPolicy: 'cache-and-network',
    })

    const [fetchingMore, setFetchingMore] = useState(false)

    const { pagination, items: _items } = data?.products ?? {}

    const isLoading = _loading || loading || fetchingMore

    useEffect(() => onResults(data?.products), [onResults, data])

    useEffect(() => onLoading(loading), [onLoading, loading])

    /**
     * Infinite Scroll
     */
    const productListRef = useRef<HTMLDivElement>(null)

    const items = _items
        ?.filter((x: any) => x !== null) // patches results returning nulls. I'm looking at you Gift Cards
        .map(({ id, image, price, title, options, group, downloads, urlKey, urlSuffix = '' }: any, index: number) => ({
            lazy: index > 0,
            _id: `${id}--${index}`,
            as: Link,
            href: urlKey + urlSuffix,
            urlResolver: {
                type: 'PRODUCT',
                id,
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
                label: price.maximum.regular.value > price.minimum.regular.value || group?.length > 1 || downloads?.length > 1 ? 'Starting at' : undefined,
                regular: downloads?.length > 1 ? Math.min(...downloads.map((x: any) => x.price)) : price.minimum.regular.value,
                special: price.minimum.discount.amountOff && price.minimum.final.value - price.minimum.discount.amountOff,
                currency: price.minimum.regular.currency,
            },
            title: {
                text: title,
            },
            colors: options
                ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch?.__typename === 'ColorSwatchData'))
                ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
        }))

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
            disabled: isLoading || !(pagination && pagination.current < pagination.total),
            threshold: 400,
            contentRef: productListRef,
        }
    )

    return type === 'grid' ? (
        <React.Fragment>
            <Root>
                <Wrapper>
                    <ProductListWrapper $margin ref={productListRef}>
                        <ProductList loadingMore={isLoading} items={items} />
                    </ProductListWrapper>
                </Wrapper>
            </Root>

            {includeFilters && (
                <Filters
                    open={openFilters}
                    loading={isLoading}
                    filters={data?.products?.filters}
                    defaultSelected={{ ...filters.selected }}
                    onUpdate={handleOnFiltersUpdate}
                    onClose={() => onToggleFilters(false)}
                />
            )}
        </React.Fragment>
    ) : (
        <ProductCarousel loading={isLoading} items={items} />
    )
}
