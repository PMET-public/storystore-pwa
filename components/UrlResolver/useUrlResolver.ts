import { useQuery } from '@apollo/react-hooks'
import useValueUpdated from '../../hooks/useValueUpdated'
import { useAppContext } from 'luma-ui/dist/AppProvider'

import URL_RESOLVER_QUERY from './graphql/urlResolver.graphql'

export const useUrlResolver = (props: { url: string }) => {
    const { url } = props

    const query = useQuery(URL_RESOLVER_QUERY, {
        variables: { url },
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
