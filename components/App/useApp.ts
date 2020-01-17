import { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { writeInLocalStorage } from '../../lib/localStorage'

import APP_QUERY from './graphql/app.graphql'
// import CART_QUERY from './graphql/cart.graphql'
import CREATE_EMPTY_CART_MUTATION from './graphql/createEmptyCart.graphql'

const { CONTENT_PARENT_CATEGORIES_ID: categoryId, CONTENT_FOOTER_BLOCK_ID: footerBlockId } = process.browser
    ? (window as any)
    : process.env

export const useApp = () => {
    const query = useQuery(APP_QUERY, {
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
        variables: {
            categoryId,
            footerBlockId,
            hasFooter: !!footerBlockId,
        },
    })

    /**
     * No Cart no problem. Let's create one
     */

    const [createEmptyCart, { loading: creatingEmptyCart }] = useMutation(CREATE_EMPTY_CART_MUTATION, {
        update: (cache, { data: { cartId } }) => {
            writeInLocalStorage('cartId', cartId)

            cache.writeData({
                data: { cartId },
            })
        },
    })

    useEffect(() => {
        if (query.loading || creatingEmptyCart) return

        if (query.error || query.data?.hasCart === false) {
            createEmptyCart().then(() => query.refetch())
        }
    }, [query.error, query.data])

    return {
        ...query,
        data: query.data && {
            ...query.data,
            footer: query.data.footer?.items[0],
        },
    }
}
