import { queryDefaultOptions } from '~/lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import PAGE_QUERY from './graphql/page.graphql'

export const usePage = (props: { id: number }) => {
    const { id } = props

    const page = useQuery(PAGE_QUERY, {
        ...queryDefaultOptions,
        variables: { id },
    })

    return {
        ...page,
    }
}

export type PageProps = ReturnType<typeof usePage>
