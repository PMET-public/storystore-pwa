import { useState } from 'react'
import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import SEARCH_QUERY from './graphql/search.graphql'

type FilterValues = {
    [key: string]: {
        eq: string
    }
}

export const useSearch = (props: { queryString?: string }) => {
    const { queryString = '' } = props

    const [filters] = useState<FilterValues>({})

    const search = useQuery(SEARCH_QUERY, {
        ...queryDefaultOptions,
        variables: { search: queryString, filters },
    })

    return {
        queries: {
            search,
        },
    }
}
