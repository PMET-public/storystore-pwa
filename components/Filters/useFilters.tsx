import { useCallback } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { queryDefaultOptions } from '~/lib/apollo/client'

import FILTERS_QUERY from './graphql/filters.graphql'
// import { useRouter } from 'next/router'

const TYPES = {
    FilterEqualTypeInput: 'equal',
    FilterMatchTypeInput: 'match',
    FilterRangeTypeInput: 'range',
}

export type FiltersProps = Array<{
    code: string
    title: string
    options: Array<{
        count: number
        label: string
        value: string[]
    }>
}>

export type UseFiltersProps = {
    filterValues?: FiltersProps
}

export const useFilters = (props: UseFiltersProps) => {
    const { filterValues } = props

    // const history = useRouter()

    /**
     * Attribute Type is not part of the Filter Query. We need to query all types available first,
     */
    const filters = useQuery(FILTERS_QUERY, {
        ...queryDefaultOptions,
        fetchPolicy: 'cache-first',
    })

    const filterTypes = filters.data?.filterTypes?.fields

    const handleOnValues = useCallback(
        callback => (fields: { [name: string]: string[] }) => {
            const groups = Object.entries(fields).filter(item => Boolean(item[1].length))

            // history.push(
            //     {
            //         pathname: history.pathname,
            //         query: {
            //             filters: JSON.stringify(groups),
            //         },
            //     },
            //     {
            //         pathname: history.asPath,
            //         query: {
            //             filters: JSON.stringify(groups),
            //         },
            //     },
            //     { shallow: true }
            // )

            const variables = groups.reduce((_groups, [_name, _values]) => {
                const [type, name] = _name.split(':')

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

            callback(variables)
        },
        []
    )

    /**
     * Let's transform our data
     */
    const items = filterValues?.map(filter => {
        const attributeType: keyof typeof TYPES = filterTypes.find((field: any) => field.name === filter.code)?.type.name

        // Get Type
        const type = TYPES[attributeType]

        return {
            ...filter,
            type,
        }
    })

    return {
        queries: {
            filters: {
                ...filters,
                data: {
                    items, // and return it
                },
            },
        },
        api: {
            onValues: handleOnValues,
        },
    }
}
