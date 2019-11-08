import { useQuery } from '@apollo/react-hooks'
import { useValueUpdated } from '../../hooks/useValueUpdated'

import PAGE_QUERY from './graphql/page.graphql'

export const usePage = (props: { id: number }) => {
    const { id } = props

    const query = useQuery(PAGE_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
    })

    /**
     * Refetch when back online
     */
    useValueUpdated(() => {
        if (query.error && query.data.offline === false) query.refetch()
    }, query.data.offline)

    return {
        ...query,
        offline: query.data.offline,
    }
}
