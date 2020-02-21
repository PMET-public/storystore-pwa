import { queryDefaultOptions } from '../../apollo/client'
import { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { writeInLocalStorage } from '../../lib/localStorage'

import APP_QUERY from './graphql/app.graphql'
import FOOTER_QUERY from './graphql/footer.graphql'
import CART_QUERY from './graphql/cart.graphql'
import CREATE_EMPTY_CART_MUTATION from './graphql/createEmptyCart.graphql'

export const useApp = ({
    categoriesParentId,
    footerBlockId,
}: {
    categoriesParentId: string
    footerBlockId: string
}) => {
    const query = useQuery(APP_QUERY, {
        ...queryDefaultOptions,
        variables: {
            categoriesParentId,
        },
    })

    const footerQuery = useQuery(FOOTER_QUERY, {
        ...queryDefaultOptions,
        variables: {
            hasFooter: !!footerBlockId,
            footerBlockId,
        },
    })

    /**
     * No Cart no problem. Let's create one
     */

    const cart = useQuery(CART_QUERY, { ...queryDefaultOptions })

    const [createEmptyCart, { loading: creatingEmptyCart }] = useMutation(CREATE_EMPTY_CART_MUTATION, {
        update: (cache, { data: { cartId } }) => {
            writeInLocalStorage('cartId', cartId)

            cache.writeData({
                data: { cartId },
            })
        },
    })

    useEffect(() => {
        if (cart.loading || creatingEmptyCart) return

        if (cart.data?.hasCart === false) {
            createEmptyCart().then(() => cart.refetch())
        }
    }, [cart.data])

    return {
        ...query,
        footer: { ...footerQuery },
        data: {
            ...cart?.data,
            ...query?.data,
            footer: query.data?.footer?.items[0],
        },
    }
}
