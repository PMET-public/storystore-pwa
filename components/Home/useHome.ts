import { useQuery } from '@apollo/react-hooks'
import { useValueUpdated } from '../../hooks/useValueUpdated'
import { useAppContext } from '@pmet-public/luma-ui/dist/AppProvider'

import HOME_QUERY from './graphql/home.graphql'

export const useHome = ({ id, categoryParentId }: { id: string; categoryParentId: string }) => {
    const query = useQuery(HOME_QUERY, {
        variables: { id, categoryParentId },
        returnPartialData: true,
        fetchPolicy: 'cache-and-network',
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
