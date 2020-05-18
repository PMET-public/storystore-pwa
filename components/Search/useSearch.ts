import { useState, useCallback } from 'react'
import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import SEARCH_QUERY from './graphql/search.graphql'

type FilterValues = {
    [key: string]: any
}

export const useSearch = (props: { queryString?: string }) => {
    const { queryString = '' } = props

    const [filters, setFilters] = useState<FilterValues>({})

    const search = useQuery(SEARCH_QUERY, {
        ...queryDefaultOptions,
        variables: { search: queryString, filters },
    })

    const handleSetFilters = useCallback(
        (filters: { [key: string]: string }) => {
            setFilters({ ...filters })
        },
        [setFilters]
    )

    return {
        queries: {
            search,
        },
        api: {
            setFilter: handleSetFilters,
        },
    }
}
