import React, { FunctionComponent, useMemo, useCallback, useState, useEffect } from 'react'
import { Root } from './Filters.styled'
import { useQuery, QueryResult } from '@apollo/client'
import { FiltersGroupProps } from '@storystore/ui/dist/components/Filters'
import FiltersComponent from '@storystore/ui/dist/components/Filters'
import FILTERS_TYPES_QUERY from './graphql/filtersTypes.graphql'

const TYPES = {
    FilterEqualTypeInput: 'equal',
    FilterMatchTypeInput: 'match',
    FilterRangeTypeInput: 'range',
}

export type FilterVariables = {
    [key: string]: {
        in?: string[]
        eq?: string
    }
}

export type FilterSelected = { [key: string]: any[] }

export type FiltersProps = {
    defaultSelected?: FilterSelected
    onUpdate?: (_: FilterVariables) => any
    onClose?: () => any
}

export const Filters: FunctionComponent<QueryResult & FiltersProps> = ({ data, loading, defaultSelected = {}, onUpdate }) => {
    const [selectedFilters, setSelectedFilters] = useState<FilterSelected>(defaultSelected)

    const [cachedData, setCachedData] = useState<any>(null)

    useEffect(() => {
        if (data) setCachedData(data)
    }, [data])

    /**
     * Attribute Type is not part of the Filter Query. We need to query all types available first,
     */
    const filtersQuery = useQuery(FILTERS_TYPES_QUERY, {
        fetchPolicy: 'cache-first',
    })

    const filterTypes = filtersQuery.data?.filterTypes?.fields

    // Lets transform our groups
    const groups: FiltersGroupProps[] = useMemo(
        () => [
            ...(cachedData?.products.filters.map((filter: any) => {
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

                const count = typeof selectedFilters[filter.code] === 'string' ? 1 : selectedFilters[filter.code]?.length

                return {
                    _id: filter.code,
                    title: filter.title + (count ? ` (${count})` : ''),
                    name: filter.code,
                    items,
                }
            }) ?? []),
        ],
        [cachedData, selectedFilters]
    )

    // Handle Updates on Filter
    const handleOnFilterUpdate = useCallback(
        fields => {
            if (!filterTypes || !onUpdate) return {}

            /** Merge selected values with fields values and filter down to only selected */
            const selected = Object.keys(fields).reduce((accum, key) => (!!fields[key].length ? { ...accum, [key]: fields[key] } : { ...accum }), {})

            const variables = Object.entries(selected).reduce((_groups, [name, _values]: any) => {
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
                        value = { in: typeof _values === 'string' ? _values : [..._values] }
                        break

                    case 'equal':
                        value = { in: typeof _values === 'string' ? _values : [..._values] }
                        break

                    default:
                        // let's do "match" as default
                        value = { match: typeof _values === 'string' ? _values : _values[0] }
                        break
                }

                return {
                    ..._groups,
                    [name]: value,
                }
            }, {})

            // keep track of selected options
            setSelectedFilters(selected)

            // execute callback
            onUpdate({ selected, variables })
        },
        [filterTypes, onUpdate]
    )

    return (
        <Root>
            <FiltersComponent loading={loading && !cachedData} title="Filters" disabled={loading} options={{ defaultValues: selectedFilters }} groups={groups} onValues={handleOnFilterUpdate} />
        </Root>
    )
}
