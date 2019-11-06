import { useQuery } from '@apollo/react-hooks'

import HOME_QUERY from './graphql/home.graphql'

const id = process.env.HOME_PAGE_ID
const categoryId = process.env.PARENT_CATEGORIES_ID

export const useHome = () => {
    const query = useQuery(HOME_QUERY, {
        variables: { id, categoryId },
        fetchPolicy: 'cache-first',
    })

    return {
        ...query,
    }
}
