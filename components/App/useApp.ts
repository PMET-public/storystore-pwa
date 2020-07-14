import { queryDefaultOptions } from '~/lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import APP_QUERY from './graphql/app.graphql'

export const useApp = () => {
    const app = useQuery(APP_QUERY, {
        ...queryDefaultOptions,
    })

    return {
        ...app,
    }
}

export type AppProps = ReturnType<typeof useApp>
