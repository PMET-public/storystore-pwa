import { useQuery } from '@apollo/react-hooks'
import { useValueUpdated } from '../../hooks/useValueUpdated'
import { useAppContext } from '@pmet-public/luma-ui/dist/AppProvider'

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
