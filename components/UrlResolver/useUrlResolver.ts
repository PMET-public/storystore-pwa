import { useQuery } from '@apollo/react-hooks'
import useValueUpdated from '../../hooks/useValueUpdated'
import { useAppContext } from 'luma-ui/dist/AppProvider'

import URL_RESOLVER_QUERY from './graphql/urlResolver.graphql'

export const useUrlResolver = (props: { skip?: boolean; url: string }) => {
    const { url, skip = false } = props

    const query = useQuery(URL_RESOLVER_QUERY, {
        variables: { url },
        fetchPolicy: 'cache-and-network',
        // returnPartialData: true,
        skip,
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
