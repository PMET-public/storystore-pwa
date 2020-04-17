import React, { FunctionComponent, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { resolveImage } from '~/lib/resolveImage'

import {
    Root,
    TopBar,
    TopBarWrapper,
    // TopBarFilterButton,
    // FiltersIcon,
    Content,
    ProductListWrapper,
    // FiltersWrapper,
    // FiltersButtons,
    // FiltersScreen,
    NoResult,
} from './Search.styled'

import { useSearch } from './useSearch'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useRouter } from 'next/router'
import { useInfiniteScrolling } from '@pmet-public/luma-ui/dist/hooks/useInfiniteScrolling'

import Link from '~/components/Link'
import Head from '~/components/Head'
import SearchBar from '@pmet-public/luma-ui/dist/components/SearchBar'
import ProductList from '@pmet-public/luma-ui/dist//components/ProductList'

const Error = dynamic(() => import('~/components/Error'))

type SearchProps = {}

export const Search: FunctionComponent<SearchProps> = () => {
    const history = useRouter()

    const { query = '' } = history.query

    const { queries, api } = useSearch({ queryString: query?.toString() })

    const products = queries.search.data?.products

    const productUrlSuffix = queries.search.data?.store?.productUrlSuffix ?? ''

    /**
     * Infinite Scroll Effect
     */
    useInfiniteScrolling(() => {
        if (queries.search.loading) return

        const { products } = queries.search.data

        // ignore if it is loading or has no pagination
        if (!products?.pagination) return

        // don't run if it's in the last page
        if (!(products.pagination.current < products.pagination.total)) return

        // load more products
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

    const productsCount = useMemo(() => {
        if (!products) return
        const { count = 0 } = products
        return `${count > 999 ? '+999' : count} ${count === 0 || count > 1 ? 'results' : 'result'}`
    }, [products])

    const online = useNetworkStatus()

    if (!online && !products) return <Error type="Offline" />

    return (
        <React.Fragment>
            <Head title="Search" />

            <Root>
                <TopBar>
                    <TopBarWrapper $margin>
                        <SearchBar
                            loading={queries.search.loading}
                            label="Search"
                            count={productsCount}
                            value={query.toString()}
                            onUpdate={api.search}
                        />

                        {/* TODO: Integrate Filters
                                <TopBarFilterButton as="button" type="button" onClick={handleToggleFilters}>
                                    <span>
                                        <FiltersIcon aria-label="Filters" />
                                    </span>
                                </TopBarFilterButton> 
                                */}
                    </TopBarWrapper>
                </TopBar>
                <Content>
                    {products && (
                        <ProductListWrapper $margin>
                            <ProductList
                                loadingMore={queries.search.loading}
                                items={products.items?.map(
                                    ({ id, image, price, title, urlKey }: any, index: number) => ({
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
                                        },
                                        price: {
                                            label:
                                                price.maximum.regular.value > price.minimum.regular.value
                                                    ? 'Starting at'
                                                    : undefined,
                                            regular: price.minimum.regular.value,
                                            special:
                                                price.minimum.discount.amountOff &&
                                                price.minimum.final.value - price.minimum.discount.amountOff,
                                            currency: price.minimum.regular.currency,
                                        },
                                        title: {
                                            text: title,
                                        },
                                    })
                                )}
                            />
                        </ProductListWrapper>
                    )}
                </Content>
                {/* TODO: Integrate Filters */}
                {/* <FiltersWrapper $active={showFilter} $height={height} ref={filtersRef}>
                            <Filters {...filters} />
                            {filters.closeButton && (
                                <FiltersButtons>
                                    <Button
                                        as="button"
                                        type="button"
                                        onClick={handleCloseFilters}
                                        {...filters.closeButton}
                                    />
                                </FiltersButtons>
                            )}
                        </FiltersWrapper>

                        {showFilter && <FiltersScreen onClick={handleCloseFilters} />} */}
                )}
            </Root>

            {query && products?.count === 0 && (
                <NoResult $margin>
                    <Error type="404">
                        We couldn’t find any results for "{query}". <br />
                        Please try the field above to search again.
                    </Error>
                </NoResult>
            )}

            {/* Delete Below */}

            {/* <CategoryTemplate
                loading={queries.search.loading}
                loadingMore={queries.search.loading}
                search={{
                    searchBar: {
                        label: 'Search',
                        count: getProductCount(),
                        value: query.toString(),
                        onUpdate: api.search,
                    },
                    noResult: getNotResult(),
                }}
                products={{
                    items: products?.items.map(({ id, image, price, title, urlKey }: any, index: number) => ({
                        _id: `${id}--${index}`,
                        as: Link,
                        href: `/${urlKey}${productUrlSuffix}`,
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
                        },
                        price: {
                            label:
                                price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined,
                            regular: price.minimum.regular.value,
                            special:
                                price.minimum.discount.amountOff &&
                                price.minimum.final.value - price.minimum.discount.amountOff,
                            currency: price.minimum.regular.currency,
                        },
                        title: {
                            text: title,
                        },
                    })),
                }}
            /> */}
        </React.Fragment>
    )
}
