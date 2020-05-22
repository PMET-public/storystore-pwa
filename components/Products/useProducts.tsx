import { useCallback, useMemo } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { queryDefaultOptions } from '~/lib/apollo/client'
import { FiltersGroupProps } from '@storystore/ui/dist/components/Filters'

import { useRouter } from 'next/router'

import FILTERS_QUERY from './graphql/filterTypes.graphql'
import PRODUCTS_QUERY from './graphql/products.graphql'

const TYPES = {
    FilterEqualTypeInput: 'equal',
    FilterMatchTypeInput: 'match',
    FilterRangeTypeInput: 'range',
}

export type FilterValues = {
    [key: string]: {
        in?: string[]
        eq?: string
    }
}

export type UseFiltersProps = {
    search?: string
    filters?: FilterValues
}

export const useProducts = (props: UseFiltersProps) => {
    const { search, filters: filtersValues = {} } = props

    const history = useRouter()

    /**
     * Attribute Type is not part of the Filter Query. We need to query all types available first,
     */
    const filters = useQuery(FILTERS_QUERY, {
        ...queryDefaultOptions,
        fetchPolicy: 'cache-first',
    })

    const filterTypes = filters.data?.filterTypes?.fields

    const filtersDefaultValues = useMemo(() => {
        return JSON.parse(history.query?.filters?.toString() || '{}')
    }, [history])

    const filtersCount = useMemo(() => Object.keys(filtersDefaultValues).reduce((total, key) => (filtersDefaultValues[key]?.length ?? 0) + total, 0), [filtersDefaultValues])

    // Get Variables with their corresponding functional value
    const filterVariables = useMemo(() => {
        if (!filterTypes) return {}
        return Object.entries(filtersDefaultValues).reduce((_groups, [name, _values]: any) => {
            const attributeType: keyof typeof TYPES = filterTypes.find((field: any) => field.name === name)?.type.name

            const type = TYPES[attributeType]

            let value

            switch (type) {
                case 'range':
                    // ['10_20', '20-30']-> { from: '10', to: '30'}
                    const { from, to } = _values.reduce(
                        (accum: any, item: any) => {
                            const _price = item.split('_')
                            const _from = Number(_price[0])
                            const _to = Number(_price[1])

                            return {
                                from: _from < accum.from ? _from : accum.from,
                                to: _to > accum.to ? _to : accum.to,
                            }
                        },
                        { from: 0, to: 0 }
                    )

                    value = { from: String(from), to: String(to) }
                    break

                case 'match':
                    value = { in: [..._values] }
                    break

                case 'equal':
                    value = { in: [..._values] }
                    break

                default:
                    // let's do "match" as default
                    value = { match: _values[0] }
                    break
            }

            return {
                ..._groups,
                [name]: value,
            }
        }, {})
    }, [filtersDefaultValues, filterTypes])

    /** Get Products */
    const products = useQuery(PRODUCTS_QUERY, {
        ...queryDefaultOptions,
        variables: { search, filters: { ...filtersValues, ...filterVariables } },
    })

    // Lets transform our groups
    const groups: FiltersGroupProps[] =
        products.data?.products?.filters?.map((filter: any) => {
            /**
             * Let's include the Type since it's not returned within the GraphQL Query.
             */
            // const attributeType: keyof typeof TYPES = filterTypes.find((field: any) => field.name === filter.code)?.type.name
            // const type = TYPES[attributeType]

            /** Fix some Labels */
            const items = filter.options.map((option: any) => {
                let label = option.label

                switch (label) {
                    case '0':
                        label = 'No'
                        break

                    case '1':
                        label = 'Yes'
                        break
                    default:
                        break
                }

                return {
                    _id: option.value,
                    count: option.count,
                    label,
                    value: option.value.toString(),
                }
            })

            const count = filtersDefaultValues[filter.code]?.length

            return {
                _id: filter.code,
                title: filter.title + (count ? ` (${count})` : ''),
                name: filter.code,
                items,
            }
        }) ?? []

    // Handle Updates on Filter
    const handleOnFilterUpdate = useCallback(
        fields => {
            /** Merge selected values with fields values and filter down to only selected */
            const groups = Object.keys(fields).reduce((accum, key) => (!!fields[key].length ? { ...accum, [key]: fields[key] } : { ...accum }), {})

            /** Update the URL Query */
            history.push(
                {
                    pathname: history.pathname,
                    query: {
                        ...history.query,
                        filters: JSON.stringify({ ...groups }),
                    },
                },
                {
                    pathname: history.asPath.split('?')[0],
                    query: {
                        ...history.query,
                        filters: JSON.stringify({ ...groups }),
                    },
                }
            )
        },
        [history]
    )

    return {
        queries: {
            filters: {
                ...filters,
                data: {
                    count: filtersCount,
                    defaultValues: filtersDefaultValues,
                    groups,
                },
            },
            products,
        },

        api: {
            onFilterUpdate: handleOnFilterUpdate,
        },
    }
}
