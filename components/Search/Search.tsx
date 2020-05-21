import React, { FunctionComponent, useMemo, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { resolveImage } from '~/lib/resolveImage'

import { Root, TopBar, TopBarWrapper, TopBarFilterButton, FiltersIcon, Content, ProductListWrapper, NoResult, FiltersWrapper } from './Search.styled'

import { useSearch } from './useSearch'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useRouter } from 'next/router'
import { useFetchMoreOnScrolling } from '@storystore/ui/dist/hooks/useFetchMoreOnScrolling'

import Link from '~/components/Link'
import Head from '~/components/Head'
import SearchBar from '@storystore/ui/dist/components/SearchBar'
import ProductList from '@storystore/ui/dist/components/ProductList'
import Filters from '~/components/Filters'

const Error = dynamic(() => import('~/components/Error'))

type SearchProps = {}

export const Search: FunctionComponent<SearchProps> = () => {
    const history = useRouter()

    const { query = '' } = history.query

    const { queries, api } = useSearch({ queryString: query?.toString() })

    const products = queries.search.data?.products

    const productUrlSuffix = queries.search.data?.store?.productUrlSuffix ?? ''

    const online = useNetworkStatus()

    const [showFilters, setShowFilter] = useState(true)

    const handleToggleFilters = useCallback(() => {
        setShowFilter(!showFilters)
    }, [showFilters, setShowFilter])

    /**
     * Infinite Scroll Effect
     */
    useFetchMoreOnScrolling({ threshold: 400, loading: queries.search.loading, hasNextPage: products?.pagination && products.pagination.current < products.pagination.total }, () => {
        queries.search
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
    })

    const handleOnNewSearch = useCallback(
        async (newQuery: string) => {
            if (newQuery.length === 0 || newQuery.length > 2) {
                await history.push(`/search?query=${newQuery}`, `/search?query=${newQuery}`, { shallow: true })
                window.scrollTo(0, 0)
            }
        },
        [history]
    )

    const productsCount = useMemo(() => {
        if (!products) return
        const { count = 0 } = products
        return `${count > 999 ? '+999' : count} ${count === 0 || count > 1 ? 'results' : 'result'}`
    }, [products])

    if (!online && !products) return <Error type="Offline" fullScreen />

    return (
        <React.Fragment>
            <Head title="Search" />

            <Root>
                <TopBar>
                    <TopBarWrapper $margin>
                        <SearchBar loading={queries.search.loading} label="Search" count={productsCount} value={query.toString()} onUpdate={handleOnNewSearch} />

                        {queries.search.data?.products?.filters && (
                            <TopBarFilterButton as="button" type="button" onClick={handleToggleFilters}>
                                <span>
                                    <FiltersIcon aria-label="Filters" />
                                </span>
                            </TopBarFilterButton>
                        )}
                    </TopBarWrapper>
                </TopBar>
                <Content $showFilters={showFilters}>
                    <ProductListWrapper>
                        <ProductList
                            loadingMore={queries.search.loading}
                            items={products?.items
                                ?.filter((x: any) => x !== null) // patches results returning nulls. I'm looking at you Gift Cards
                                .map(({ id, image, price, title, urlKey, options }: any, index: number) => {
                                    return {
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
                                    }
                                })}
                        />
                    </ProductListWrapper>
                    <FiltersWrapper>
                        <Filters
                            loading={queries.search.loading && queries.search.networkStatus !== 3}
                            items={queries.search.data?.products?.filters?.map(({ title, code, options }: any) => {
                                return {
                                    title,
                                    code,
                                    options: options.map(({ count, label, value }: any) => ({
                                        count,
                                        label,
                                        value,
                                    })),
                                }
                            })}
                            onValues={api.setFilter}
                        />
                    </FiltersWrapper>
                </Content>
            </Root>

            {query && products?.count === 0 && (
                <NoResult $margin>
                    <Error type="404">
                        We couldn&apos;t find any results for &quot;{query}&quot;. <br />
                        Please try the field above to search again.
                    </Error>
                </NoResult>
            )}
        </React.Fragment>
    )
}
