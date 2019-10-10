import { useQuery } from '@apollo/react-hooks'
import useNetworkUpdates from '../../api/useNetworkUpdates'
import useCart from '../../api/useCart'

import APP_QUERY from './queries/app.graphql'

export const useApp = (options: { categoryId: number }) => {
    useNetworkUpdates()
    useCart()

    const query = useQuery(APP_QUERY, {
        fetchPolicy: 'cache-first',
        variables: { categoryId: options.categoryId },
    })

    return { query }
}
