import { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { writeInLocalStorage } from '../../lib/localStorage'

import APP_QUERY from './graphql/app.graphql'
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
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
        variables: {
            categoriesParentId,
            footerBlockId,
            hasFooter: !!footerBlockId,
        },
    })

    /**
     * No Cart no problem. Let's create one
     */

    const cart = useQuery(CART_QUERY)

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

        if (cart.error || cart.data?.hasCart === false) {
            createEmptyCart().then(() => cart.refetch())
        }
    }, [cart.error, cart.data])

    return {
        ...query,
        data: {
            ...cart?.data,
            ...query?.data,
            footer: query.data?.footer?.items[0],
        },
    }
}
