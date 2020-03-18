import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import SETTINGS_QUERY from './graphql/settings.graphql'

export const useSettings = () => {
    const query = useQuery(SETTINGS_QUERY, {
        ...queryDefaultOptions,
    })

    return {
        ...query,
    }
}
