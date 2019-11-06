import { useQuery } from '@apollo/react-hooks'

import HOME_QUERY from './graphql/home.graphql'

const id = LUMA_ENV.HOME_PAGE_ID
const categoryId = LUMA_ENV.PARENT_CATEGORIES_ID

export const useHome = () => {
    const query = useQuery(HOME_QUERY, {
        variables: { id, categoryId },
        fetchPolicy: 'cache-first',
    })

    return {
        ...query,
    }
}
