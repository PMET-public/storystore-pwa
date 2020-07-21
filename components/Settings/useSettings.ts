import { useQuery } from '@apollo/client'

import SETTINGS_QUERY from './graphql/settings.graphql'

export const useSettings = () => {
    const settings = useQuery(SETTINGS_QUERY)

    return {
        ...settings,
    }
}

export type SettingsProps = ReturnType<typeof useSettings>
