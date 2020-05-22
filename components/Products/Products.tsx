import React, { FunctionComponent } from 'react'
import { resolveImage } from '~/lib/resolveImage'

import { Root, ProductListWrapper, FiltersWrapper } from './Products.styled'

import { useProducts } from './useProducts'
import { useFetchMoreOnScrolling } from '@storystore/ui/dist/hooks/useFetchMoreOnScrolling'

import ProductList from '@storystore/ui/dist/components/ProductList'
import Filters from '@storystore/ui/dist/components/Filters'
import Link from '~/components/Link'

type CategoryProps = ReturnType<typeof useProducts> & { showFilters?: boolean }

export const Products: FunctionComponent<CategoryProps> = ({ queries, api, showFilters }) => {
    const products = queries.products.data?.products
    const filters = queries.filters.data

    /**
     * Infinite Scroll Effect
     */
    useFetchMoreOnScrolling(
        {
            threshold: 400,
            loading: queries.products.loading,
            hasNextPage: products?.pagination && products.pagination.current < products.pagination.total,
        },
        () => {
            if (!products.pagination?.current) return

            queries.products
                .fetchMore({
                    variables: {
                        currentPage: products.pagination.current + 1, // next page
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
        }
    )

    const productUrlSuffix = queries.products.data?.store?.productUrlSuffix ?? ''

    return (
        <Root $showFilters={showFilters}>
            <ProductListWrapper>
                <ProductList
                    loadingMore={queries.products.loading}
                    items={products?.items
                        ?.filter((x: any) => x !== null) // patches results returning nulls. I'm looking at you Gift Cards
                        .map(({ id, image, price, title, urlKey, options }: any, index: number) => ({
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
                                src: {
                                    desktop: resolveImage(image.src, { width: 1260 }),
                                    mobile: resolveImage(image.src, { width: 960 }),
                                },
                                width: 1274,
                                height: 1580,
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
                                ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch.__typename === 'ColorSwatchData'))
                                ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                        }))}
                />
            </ProductListWrapper>
            <FiltersWrapper>
                <Filters
                    key={JSON.stringify(filters.defaultValues)}
                    disabled={queries.products.loading && queries.products.networkStatus !== 3}
                    options={{ defaultValues: filters.defaultValues }}
                    groups={filters.groups.filter(group => group.name !== 'category_id')}
                    onValues={api.onFilterUpdate}
                />
            </FiltersWrapper>
        </Root>
    )
}
