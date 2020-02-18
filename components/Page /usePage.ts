import { queryDefaultOptions } from '../../apollo/client'
import { useQuery } from '@apollo/react-hooks'
import { useValueUpdated } from '../../hooks/useValueUpdated'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'

import PAGE_QUERY from './graphql/page.graphql'

export const usePage = (props: { id: number }) => {
    const { id } = props

    const query = useQuery(PAGE_QUERY, {
        ...queryDefaultOptions,
        variables: { id },
    })

    /**
     * Refetch when back online
     */
    const online = useNetworkStatus()

    useValueUpdated(() => {
        if (online) query.refetch()
    }, online)

    return {
        ...query,
        online,
    }
}
