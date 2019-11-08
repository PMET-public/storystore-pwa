import { useQuery } from '@apollo/react-hooks'
import { useValueUpdated } from '../../hooks/useValueUpdated'
import { useAppContext } from 'luma-ui/dist/AppProvider'

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
    const {
        state: { online },
    } = useAppContext()

    useValueUpdated(() => {
        if (query.error && online) query.refetch()
    }, online)

    return {
        ...query,
        online,
    }
}
