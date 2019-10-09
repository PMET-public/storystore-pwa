import { useQuery } from '@apollo/react-hooks'

import PAGE_QUERY from './queries/page.graphql'

export const usePage = (options: { id: number }) => {
    const { id } = options

    const query = useQuery(PAGE_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
    })

    return {
        query,
    }
}
