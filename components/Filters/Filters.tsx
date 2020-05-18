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
                queries.filters.data?.items?.map(({ title, code, type, options }: any) => {
                    return {
                        title,
                        name: `${type}:${code}`,
                        items: options.map(({ count, label, value, active, disabled }: any, _id: number) => ({
                            _id,
                            active,
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
