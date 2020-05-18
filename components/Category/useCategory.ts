import { useState, useCallback } from 'react'
import { queryDefaultOptions } from '~/lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import CATEGORY_QUERY from './graphql/category.graphql'
import PRODUCTS_QUERY from './graphql/products.graphql'

type FilterValues = {
    [key: string]: {
        in?: string[]
        eq?: string
    }
}

export const useCategory = (props: { id: number }) => {
    const { id } = props

    const category = useQuery(CATEGORY_QUERY, {
        ...queryDefaultOptions,
        variables: { id: id.toString() },
    })

    const [filters, setFilters] = useState<FilterValues>({
        category_id: {
            eq: id.toString(),
        },
    })

    const products = useQuery(PRODUCTS_QUERY, {
        ...queryDefaultOptions,
        variables: { filters },
    })

    const handleSetFilters = useCallback(
        (filters: { [key: string]: string }) => {
            setFilters({
                category_id: {
                    eq: id.toString(),
                },
                ...filters,
            })
        },
        [id, setFilters]
    )

    return {
        queries: {
            category,
            products,
        },
        api: {
            setFilter: handleSetFilters,
        },
    }
}
