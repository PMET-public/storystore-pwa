import { useQuery } from '@apollo/react-hooks'

import HOME_QUERY from './graphql/home.graphql'

export const useHome = (props: { id: number; categoryId: number }) => {
    const { id, categoryId } = props

    const query = useQuery(HOME_QUERY, {
        variables: { id, categoryId },
        fetchPolicy: 'cache-first',
    })

    return {
        ...query,
    }
}
