import React, { FunctionComponent, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { Root, NoResult } from './Search.styled'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import Head from '~/components/Head'
import SearchBar from '@storystore/ui/dist/components/SearchBar'
import Products from '~/components/Products'
import Icon from '@storystore/ui/dist/components/Icon'
import TopBar from '@storystore/ui/dist/components/TopBar'
import { TopBarFilterToggleButton } from '../Category/Category.styled'
import FiltersIcon from 'remixicon/icons/System/list-settings-line.svg'
import FiltersCloseIcon from 'remixicon/icons/System/list-settings-fill.svg'
import { setURLSearchParams } from '~/lib/urlSearchParams'

const Error = dynamic(() => import('~/components/Error'))

export type SearchProps = {
    query: string
}

export const Search: FunctionComponent<SearchProps> = ({ query: _query = '' }) => {
    const [query, setQuery] = useState(_query)

    const [toggleFilters, setToggleFilters] = useState(false)

    const [hasFiltersSelected, setHasFiltersSelected] = useState(false)

    const [loading, setLoading] = useState(false)

    const [count, setCount] = useState(0)

    const online = useNetworkStatus()

    const handleOnNewSearch = useCallback(async (newQuery: string) => {
        if (newQuery.length === 0 || newQuery.length > 2) {
            setQuery(newQuery)

            setURLSearchParams({ query: newQuery })

            window.scrollTo(0, 0)
        }
    }, [])

    if (!online) return <Error type="Offline" fullScreen />

    return (
        <React.Fragment>
            <Head title="Search" />

            <Root>
                <TopBar sticky>
                    <SearchBar loading={loading} label="Search" count={`${count > 99 ? '99+' : count} results`} value={query} onUpdate={handleOnNewSearch} />

                    <TopBarFilterToggleButton onClick={() => setToggleFilters(!toggleFilters)}>
                        <Icon svg={toggleFilters ? FiltersCloseIcon : FiltersIcon} aria-label="Filters" attention={hasFiltersSelected} />
                    </TopBarFilterToggleButton>
                </TopBar>

                <Products
                    search={query}
                    openFilters={toggleFilters}
                    onToggleFilters={state => setToggleFilters(state)}
                    onUpdatedFilters={values => setHasFiltersSelected(!!values)}
                    onResults={data => {
                        if (data) setCount(data.count)
                    }}
                    onLoading={state => setLoading(state)}
                />
            </Root>

            {query && count === 0 && (
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
