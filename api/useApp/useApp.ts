import { useQuery } from '@apollo/react-hooks'
import APP_QUERY from './queries/app.graphql'

export const useApp = (options: { categoryId: number }) => {
    const query = useQuery(APP_QUERY, {
        fetchPolicy: 'cache-first',
        variables: { categoryId: options.categoryId },
    })

    return {
        query,
    }
}
