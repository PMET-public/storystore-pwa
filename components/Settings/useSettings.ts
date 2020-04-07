import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import HOME_QUERY from '../Home/graphql/home.graphql'
import APP_QUERY from '../App/graphql/app.graphql'

type Props = {
    homePageId: string
    footerBlockId: string
}

export const useSettings = ({ homePageId, footerBlockId }: Props) => {
    const home = useQuery(HOME_QUERY, {
        ...queryDefaultOptions,
        errorPolicy: 'all',
        variables: {
            id: homePageId,
        },
    })

    const footer = useQuery(APP_QUERY, {
        ...queryDefaultOptions,
        errorPolicy: 'all',
        variables: {
            hasFooter: !!footerBlockId,
            footerBlockId,
        },
    })

    return {
        home,
        footer,
    }
}
