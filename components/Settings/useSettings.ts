import { queryDefaultOptions } from '../../lib/apollo/client'
import { useLazyQuery } from '@apollo/react-hooks'

import SETTINGS_QUERY from './graphql/settings.graphql'

export const useSettings = () => {
    const [fetchDetails, query] = useLazyQuery(SETTINGS_QUERY, {
        ...queryDefaultOptions,
    })

    return {
        fetchDetails,
        ...query,
    }
}
