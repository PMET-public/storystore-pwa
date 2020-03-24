import { queryDefaultOptions } from '../../lib/apollo/client'
import { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { writeInLocalStorage } from '../../lib/localStorage'

import APP_QUERY from './graphql/app.graphql'
import FOOTER_QUERY from './graphql/footer.graphql'
import CART_QUERY from './graphql/cart.graphql'
import CREATE_EMPTY_CART_MUTATION from './graphql/createEmptyCart.graphql'

export const useApp = ({ footerBlockId }: { footerBlockId: string }) => {
    const query = useQuery(APP_QUERY, {
        ...queryDefaultOptions,
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

    const [createEmptyCart, { data: newCartData, loading: creatingEmptyCart }] = useMutation(
        CREATE_EMPTY_CART_MUTATION,
        {
            update: (cache, { data: { cartId } }) => {
                writeInLocalStorage('cartId', cartId)

                cache.writeData({
                    data: {
                        cartId,
                    },
                })
            },
        }
    )

    useEffect(() => {
        if (cart.loading || creatingEmptyCart || !!newCartData?.cartId) return

        if (cart.error || cart.data?.hasCart === false) {
            if (process.env.NODE_ENV !== 'production') console.log('🛒 Creating new Cart')
            createEmptyCart().then(() => cart.refetch())
        }
    }, [cart, newCartData, createEmptyCart, creatingEmptyCart])

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
