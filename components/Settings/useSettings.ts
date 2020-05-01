import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import HOME_QUERY from './graphql/home.graphql'

type Props = {
    homePageId: string
}

export const useSettings = ({ homePageId }: Props) => {
    const home = useQuery(HOME_QUERY, {
        ...queryDefaultOptions,
        errorPolicy: 'all',
        variables: {
            id: homePageId,
        },
    })

    return {
        queries: {
            home,
        },
    }
}
