import { queryDefaultOptions } from '../../lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import HOME_QUERY from './graphql/home.graphql'
import FOOTER_QUERY from './graphql/footer.graphql'

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

    const footer = useQuery(FOOTER_QUERY, {
        ...queryDefaultOptions,
        errorPolicy: 'all',
        variables: {
            footerBlockId,
        },
        skip: !footerBlockId,
    })

    return {
        queries: {
            home,
            footer,
        },
    }
}
