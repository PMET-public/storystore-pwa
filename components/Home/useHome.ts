import { useQuery } from '@apollo/react-hooks'
import { useValueUpdated } from '../../hooks/useValueUpdated'

import HOME_QUERY from './graphql/home.graphql'

const id = LUMA_ENV.HOME_PAGE_ID
const categoryId = LUMA_ENV.PARENT_CATEGORIES_ID

export const useHome = () => {
    const query = useQuery(HOME_QUERY, {
        variables: { id, categoryId },
        returnPartialData: true,
        fetchPolicy: 'cache-and-network',
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
