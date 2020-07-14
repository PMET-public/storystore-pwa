import { queryDefaultOptions } from '~/lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import CATEGORY_QUERY from './graphql/category.graphql'

export const useCategory = (props: { id: number }) => {
    const { id } = props

    const category = useQuery(CATEGORY_QUERY, {
        ...queryDefaultOptions,
        variables: { id: id.toString() },
    })

    return {
        ...category,
    }
}

export type CategoryProps = ReturnType<typeof useCategory>
