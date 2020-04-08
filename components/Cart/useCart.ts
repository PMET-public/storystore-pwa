import { queryDefaultOptions } from '../../lib/apollo/client'
import { useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

import CART_QUERY from './graphql/cart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './graphql/updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './graphql/removeCartItem.graphql'
import APPLY_COUPON_MUTATION from './graphql/applyCoupon.graphql'
import REMOVE_COUPON_MUTATION from './graphql/removeCoupon.graphql'

export const useCart = () => {
    /**
     * Data Query
     */
    const cart = useQuery(CART_QUERY, {
        ...queryDefaultOptions,
    })

    /**
     * Handle Update Cart Item Action
     */
    const [updateCartItem, updatingCartItem] = useMutation(UPDATE_CART_ITEMS_MUTATION, {
        update(cache, { data: { updateCartItems } }) {
            const { cart } = updateCartItems
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleUpdateCartItem = useCallback(
        (props: { productId: number; quantity: number }) => {
            const { productId, quantity } = props
            return updateCartItem({
                variables: {
                    items: [{ cart_item_id: productId, quantity }],
                },
            })
        },
        [updateCartItem]
    )

    /**
     * Handle Remove Cart Item Action
     */
    const [removeCartItem, removingCartItem] = useMutation(REMOVE_CART_ITEM_MUTATION, {
        update(cache, { data: { removeItemFromCart } }) {
            const { cart } = removeItemFromCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleRemoveCartItem = useCallback(
        (props: { productId: number }) => {
            const { productId } = props
            return removeCartItem({
                variables: {
                    itemId: productId,
                },
            })
        },
        [removeCartItem]
    )

    /**
     * Handle Apply Coupon Code
     */
    const [applyCoupon, applyingCoupon] = useMutation(APPLY_COUPON_MUTATION, {
        update(cache, { data: { applyCouponToCart } }) {
            const { cart } = applyCouponToCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleApplyCoupon = useCallback(
        (props: { couponCode: string }) => {
            const { couponCode } = props
            return applyCoupon({
                variables: {
                    couponCode,
                },
            })
        },
        [applyCoupon]
    )

    /**
     * Handle Apply Coupon Code
     */
    const [removeCoupon, removingCoupon] = useMutation(REMOVE_COUPON_MUTATION, {
        update(cache, { data: { removeCouponFromCart } }) {
            const { cart } = removeCouponFromCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleRemoveCoupon = useCallback(() => {
        return removeCoupon()
    }, [removeCoupon])

    return {
        queries: {
            cart,
        },
        api: {
            updateCartItem: handleUpdateCartItem,
            updatingCartItem,
            removeCartItem: handleRemoveCartItem,
            removingCartItem,
            applyCoupon: handleApplyCoupon,
            applyingCoupon,
            removeCoupon: handleRemoveCoupon,
            removingCoupon,
        },
    }
}
