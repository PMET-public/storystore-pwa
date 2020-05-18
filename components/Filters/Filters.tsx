import React, { FunctionComponent } from 'react'

import { useFilters, UseFiltersProps, FiltersProps as ItemProps } from './useFilters'

import FiltersComponent from '@storystore/ui/dist/components/Filters'

export type FiltersProps = UseFiltersProps & {
    items: ItemProps
    onValues: (filters: any) => void
    loading?: boolean
}

export const Filters: FunctionComponent<FiltersProps> = ({ loading, items: filterValues, onValues }) => {
    const { queries, api } = useFilters({ filterValues })

    return (
        <FiltersComponent
            disabled={loading}
            onValues={api.onValues(onValues)}
            groups={
                queries.filters.data?.items
                    ?.filter(({ code }) => code !== 'category_id')
                    .map(({ title, code, type, options }: any) => {
                        return {
                            _id: code,
                            title,
                            name: `${type}:${code}`,
                            items: options.map(({ count, label, value, disabled }: any) => ({
                                _id: `${code}--${value}`,
                                count,
                                label,
                                value,
                                disabled,
                            })),
                        }
                    }) ?? []
            }
        />
    )
}
