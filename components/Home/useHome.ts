import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import HOME_QUERY from './graphql/home.graphql'

export const useHome = ({ id }: { id: string }) => {
    const query = useQuery(HOME_QUERY, {
        ...queryDefaultOptions,
        variables: { id },
    })

    return {
        ...query,
    }
}
