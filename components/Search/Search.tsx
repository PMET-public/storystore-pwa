import React, { FunctionComponent, useMemo, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { Root, NoResult } from './Search.styled'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useRouter } from 'next/router'
import Head from '~/components/Head'
import SearchBar from '@storystore/ui/dist/components/SearchBar'
import Products, { PRODUCTS_QUERY } from '~/components/Products'
import Icon from '@storystore/ui/dist/components/Icon'
import { useQuery } from '@apollo/client'
import TopBar from '@storystore/ui/dist/components/TopBar'
import { TopBarFilterToggleButton } from '../Category/Category.styled'
import FiltersIcon from 'remixicon/icons/System/list-settings-line.svg'
import FiltersCloseIcon from 'remixicon/icons/System/list-settings-fill.svg'
import Filters, { FilterSelected, FilterVariables } from '~/components/Filters'
import Sidebar from '@storystore/ui/dist/components/Sidebar'
import { setURLSearchParams } from '~/lib/urlSearchParams'
const Error = dynamic(() => import('~/components/Error'))

export const Search: FunctionComponent = () => {
    const router = useRouter()

    const [panelOpen, setPanelOpen] = useState(false)

    const [query, setQuery] = useState(router.query.query ?? '')

    const [filters, setFilters] = useState<{ selected: FilterSelected; variables: FilterVariables }>({ selected: {}, variables: {} })

    const products = useQuery(PRODUCTS_QUERY, {
        variables: {
            search: query.toString(),
            filters: filters.variables,
        },
        notifyOnNetworkStatusChange: true,
    })

    const { data, loading } = products

    const online = useNetworkStatus()

    const handleOnNewSearch = useCallback(async (newQuery: string) => {
        if (newQuery.length === 0 || newQuery.length > 2) {
            setQuery(newQuery)

            setURLSearchParams({ query: newQuery })

            window.scrollTo(0, 0)
        }
    }, [])

    const handleOnFiltersUpdate = useCallback(({ selected, variables }) => {
        setFilters({ selected, variables })
    }, [])

    const productsCount = useMemo(() => {
        if (!data) return
        const { count = 0 } = data.products
        return `${count > 999 ? '+999' : count} ${count === 0 || count > 1 ? 'results' : 'result'}`
    }, [data])

    if (!online && !data?.products.items) return <Error type="Offline" fullScreen />

    return (
        <React.Fragment>
            <Head title="Search" />

            <Root>
                <TopBar sticky>
                    <SearchBar loading={loading} label="Search" count={productsCount} value={query.toString()} onUpdate={handleOnNewSearch} />

                    <TopBarFilterToggleButton onClick={() => setPanelOpen(!panelOpen)}>
                        <Icon svg={panelOpen ? FiltersCloseIcon : FiltersIcon} aria-label="Filters" attention={Object.keys(filters.selected).length > 0} />
                    </TopBarFilterToggleButton>
                </TopBar>

                <Products {...products} />
            </Root>

            {query && data?.products.count === 0 && (
                <NoResult $margin>
                    <Error type="404">
                        We couldn&apos;t find any results for &quot;{query}&quot;. <br />
                        Please try the field above to search again.
                    </Error>
                </NoResult>
            )}

            <Sidebar position="right" onClose={() => setPanelOpen(false)} button={{ text: 'Done', onClick: () => setPanelOpen(false) }}>
                {panelOpen && <Filters {...products} defaultSelected={{ ...filters.selected }} onUpdate={handleOnFiltersUpdate} />}
            </Sidebar>
        </React.Fragment>
    )
}
