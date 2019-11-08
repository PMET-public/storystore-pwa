import { useValueUpdated } from '../../hooks/useValueUpdated'
import { useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

import CART_QUERY from './graphql/cart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './graphql/updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './graphql/removeCartItem.graphql'

export const useCart = () => {
    /**
     * Data Query
     */
    const query = useQuery(CART_QUERY, {
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
    })

    /**
     * Refetch when back online
     */
    useValueUpdated(() => {
        if (query.error && query.data.offline === false) query.refetch()
    }, query.data.offline)

    /**
     * Handle Update Cart Item Action
     */
    const [updateCartItems, { loading: updating }] = useMutation(UPDATE_CART_ITEMS_MUTATION, {
        update(cache, { data: { updateCartItems } }) {
            const { cart } = updateCartItems
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleUpdateCartItem = useCallback((props: { productId: number; quantity: number }) => {
        const { productId, quantity } = props
        return updateCartItems({
            variables: {
                items: [{ cart_item_id: productId, quantity }],
            },
        })
    }, [])

    /**
     * Handle Remove Cart Item Action
     */
    const [removeCartItem, { loading: removing }] = useMutation(REMOVE_CART_ITEM_MUTATION, {
        update(cache, { data: { removeItemFromCart } }) {
            const { cart } = removeItemFromCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleRemoveCartItem = useCallback((props: { productId: number }) => {
        const { productId } = props
        return removeCartItem({
            variables: {
                itemId: productId,
            },
        })
    }, [])

    return {
        ...query,
        updating,
        removing,
        offline: query.data.offline,
        api: {
            updateCartItem: handleUpdateCartItem,
            removeCartItem: handleRemoveCartItem,
        },
    }
}
