import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import PAGE_QUERY from './graphql/page.graphql'

export const usePage = (props: { id: number }) => {
    const { id } = props

    const query = useQuery(PAGE_QUERY, {
        ...queryDefaultOptions,
        variables: { id },
    })

    return {
        ...query,
    }
}
