import { queryDefaultOptions } from '../../lib/apollo/client'
import { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { writeInLocalStorage } from '../../lib/localStorage'

import APP_QUERY from './graphql/app.graphql'
import CREATE_EMPTY_CART_MUTATION from './graphql/createEmptyCart.graphql'

export const useApp = ({ footerBlockId }: { footerBlockId: string }) => {
    const app = useQuery(APP_QUERY, {
        ...queryDefaultOptions,
        errorPolicy: 'all',
        variables: {
            hasFooter: !!footerBlockId,
            footerBlockId,
        },
    })

    const storeId = app.data?.store?.id

    /**
     * No Cart no problem. Let's create one
     */
    const [createEmptyCart, creatingEmptyCart] = useMutation(CREATE_EMPTY_CART_MUTATION, {
        update: (cache, { data: { cartId } }) => {
            writeInLocalStorage('cartId', cartId)

            cache.writeData({
                data: {
                    cartId,
                },
            })
        },
    })

    useEffect(() => {
        if (!storeId || app.loading || creatingEmptyCart.loading || !!creatingEmptyCart.data?.cartId) return

        if ((app.error && !app.data?.cart) || app.data?.hasCart === false) {
            if (process.env.NODE_ENV !== 'production') console.log('🛒 Creating new Cart')
            createEmptyCart()
        }
    }, [storeId, app, createEmptyCart, creatingEmptyCart])

    return {
        queries: {
            app,
        },
    }
}
