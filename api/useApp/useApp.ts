import { useQuery } from '@apollo/react-hooks'
import useNetworkUpdates from '../../api/useNetworkUpdates'

import APP_QUERY from './queries/app.graphql'

export const useApp = (options: { categoryId: number }) => {
    useNetworkUpdates()

    const query = useQuery(APP_QUERY, {
        fetchPolicy: 'cache-first',
        variables: {
            cartId: null, // @client
            hasCart: null, // @client
            categoryId: options.categoryId,
        },
    })

    return { query }
}
