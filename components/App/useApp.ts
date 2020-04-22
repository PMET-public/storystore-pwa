import { queryDefaultOptions } from '~/lib/apollo/client'
import { useQuery } from '@apollo/react-hooks'

import { useCart } from '~/components/Cart/useCart'

import APP_QUERY from './graphql/app.graphql'
import FOOTER_QUERY from './graphql/footer.graphql'

type UseApp = {
    cartId?: string
    footerBlockId?: string
}

export const useApp = (props: UseApp = {}) => {
    const { cartId, footerBlockId } = props

    const {
        queries: { cart },
        api: { createCart, creatingCart },
    } = useCart({ cartId })

    const app = useQuery(APP_QUERY, {
        ...queryDefaultOptions,
    })

    const footer = useQuery(FOOTER_QUERY, {
        ...queryDefaultOptions,
        variables: {
            footerBlockId: footerBlockId,
        },
        skip: !footerBlockId,
    })

    return {
        queries: {
            app,
            cart,
            footer,
        },
        api: {
            createCart,
            creatingCart,
        },
    }
}
