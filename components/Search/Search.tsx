import React, { FunctionComponent, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'

import { Root, TopBar, TopBarWrapper, TopBarFilterButton, FiltersIcon, NoResult } from './Search.styled'

import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useRouter } from 'next/router'

import Head from '~/components/Head'
import SearchBar from '@storystore/ui/dist/components/SearchBar'
import Products, { useProducts } from '~/components/Products'
import Icon from '@storystore/ui/dist/components/Icon'

const Error = dynamic(() => import('~/components/Error'))

type SearchProps = {}

export const Search: FunctionComponent<SearchProps> = () => {
    const history = useRouter()

    const { query = '' } = history.query

    const _products = useProducts({ search: query.toString() })

    const {
        queries: { products, filters },
    } = _products

    const online = useNetworkStatus()

    const handleOnNewSearch = useCallback(
        async (newQuery: string) => {
            if (newQuery.length === 0 || newQuery.length > 2) {
                await history.push({
                    pathname: history.pathname,
                    query: {
                        ...history.query,
                        query: newQuery,
                    },
                })

                window.scrollTo(0, 0)
            }
        },
        [history]
    )

    const productsCount = useMemo(() => {
        const data = products.data?.products
        if (!data) return
        const { count = 0 } = data
        return `${count > 999 ? '+999' : count} ${count === 0 || count > 1 ? 'results' : 'result'}`
    }, [products])

    if (!online && !products.data?.products) return <Error type="Offline" fullScreen />

    return (
        <React.Fragment>
            <Head title="Search" />

            <Root>
                <TopBar>
                    <TopBarWrapper $margin>
                        <SearchBar loading={products.loading} label="Search" count={productsCount} value={query.toString()} onUpdate={handleOnNewSearch} />

                        <TopBarFilterButton as="button" type="button" onClick={_products.api.toggleFilters}>
                            <span>
                                <Icon svg={FiltersIcon} aria-label="Filters" count={filters.data?.count} />
                            </span>
                        </TopBarFilterButton>
                    </TopBarWrapper>
                </TopBar>

                <Products {..._products} />
            </Root>

            {query && products.data?.products?.count === 0 && (
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
