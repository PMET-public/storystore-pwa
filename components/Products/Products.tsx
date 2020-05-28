import React, { FunctionComponent } from 'react'
import { resolveImage } from '~/lib/resolveImage'

import { Root, ProductListWrapper, FiltersWrapper, SortByWrapper, FiltersButtons } from './Products.styled'

import { useProducts } from './useProducts'
import { useFetchMoreOnScrolling } from '@storystore/ui/dist/hooks/useFetchMoreOnScrolling'
import { useResize } from '@storystore/ui/dist/hooks/useResize'

import ProductList from '@storystore/ui/dist/components/ProductList'
import Filters from '@storystore/ui/dist/components/Filters'
import Link from '~/components/Link'
import SortBy from '@storystore/ui/dist/components/SortBy'
import { GroupLabel } from '@storystore/ui/dist/components/Filters/Filters.styled'
import Button from '@storystore/ui/dist/components/Button'
import Sidebar from '@storystore/ui/dist/components/Sidebar'

type CategoryProps = ReturnType<typeof useProducts>

export const Products: FunctionComponent<CategoryProps> = ({ loading, data, networkStatus, fetchMore, api }) => {
    const viewport = useResize()
    const { panelOpen, pagination, productUrlSuffix = '', items, sorting, filters } = data ?? {}

    /**
     * Infinite Scroll Effect
     */
    useFetchMoreOnScrolling(
        {
            threshold: 400,
            loading,
            hasNextPage: pagination && pagination.current < pagination.total,
        },
        () => {
            if (!pagination?.current) return

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
            }).catch(() => {})
        }
    )

    return (
        <Root>
            <ProductListWrapper>
                <ProductList
                    loadingMore={loading}
                    items={items
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

            <Sidebar position="right" onClose={() => api.togglePanel(false)}>
                {panelOpen && (
                    <FiltersWrapper style={{ height: viewport.vHeight }}>
                        {sorting?.options && (
                            <SortByWrapper>
                                <GroupLabel>Sort By</GroupLabel>
                                <SortBy
                                    options={{ defaultValues: sorting.defaultValues }}
                                    onValues={api.onSortingUpdate}
                                    items={sorting.options.map(({ label, value }: any) => ({
                                        _id: `${label}-${value}`,
                                        label,
                                        value,
                                    }))}
                                />
                            </SortByWrapper>
                        )}

                        <Filters
                            key={JSON.stringify(filters.defaultValues)}
                            disabled={loading && networkStatus !== 3}
                            options={{ defaultValues: filters.defaultValues }}
                            groups={filters.groups.filter((group: any) => group.name !== 'category_id')}
                            onValues={api.onFilterUpdate}
                        />
                        <FiltersButtons>
                            <Button onClick={() => api.togglePanel(false)}>Done</Button>
                        </FiltersButtons>
                    </FiltersWrapper>
                )}
            </Sidebar>
        </Root>
    )
}
