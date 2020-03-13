import { useEffect, useState } from 'react'
import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import CATEGORY_QUERY from './graphql/category.graphql'
import PRODUCTS_QUERY from './graphql/products.graphql'

type FilterValues = {
    [key: string]: {
        eq: string
    }
}

export const useCategory = (props: { id: number }) => {
    const { id } = props

    const query = useQuery(CATEGORY_QUERY, {
        ...queryDefaultOptions,
        variables: { id: id.toString() },
    })

    const [filterValues, setFilterValues] = useState<FilterValues>({
        category_id: {
            eq: id.toString(),
        },
    })

    function handleOnClickFilterValue(key: string, value: string) {
        setFilterValues({
            ...filterValues,
            [key]: {
                eq: value,
            },
        })
    }

    const productsQuery = useQuery(PRODUCTS_QUERY, {
        ...queryDefaultOptions,
        variables: { filters: filterValues },
    })

    /**
     * Filters
     */
    useEffect(() => {
        setFilterValues({
            category_id: {
                eq: id.toString(),
            },
        })
    }, [id])

    return {
        ...query,
        products: { ...productsQuery },
        api: {
            setFilter: handleOnClickFilterValue,
        },
    }
}
