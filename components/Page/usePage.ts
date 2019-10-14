import { useQuery } from '@apollo/react-hooks'

import PAGE_QUERY from './graphql/page.graphql'

export const usePage = (props: { id: number }) => {
    const { id } = props

    const query = useQuery(PAGE_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
        returnPartialData: true,
    })

    return {
        ...query,
    }
}
