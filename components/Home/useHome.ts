import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import HOME_QUERY from './graphql/home.graphql'

export const useHome = ({ id }: { id?: string }) => {
    const store = useQuery(
        gql`
            query {
                store: storeConfig {
                    id
                    homePageId: cms_home_page
                }
            }
        `,
        {
            ...queryDefaultOptions,
            skip: !!id, // Use default Id if not Id is provided
            fetchPolicy: 'cache-first',
        }
    )

    const defaultHomePageId = store.data?.homePageId

    const home = useQuery(HOME_QUERY, {
        ...queryDefaultOptions,
        skip: !(id || defaultHomePageId),
        variables: { id: id || defaultHomePageId },
    })

    return {
        queries: {
            home,
        },
    }
}
