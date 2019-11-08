import { useQuery } from '@apollo/react-hooks'
import useValueUpdated from '../../hooks/useValueUpdated'

import URL_RESOLVER_QUERY from './graphql/urlResolver.graphql'

export const useUrlResolver = (props: { url: string }) => {
    const { url } = props

    const query = useQuery(URL_RESOLVER_QUERY, {
        variables: { url },
        fetchPolicy: 'cache-first',
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
