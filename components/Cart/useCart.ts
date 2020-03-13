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
    const query = useQuery(CART_QUERY, {
        ...queryDefaultOptions,
    })

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

    const handleUpdateCartItem = useCallback(
        (props: { productId: number; quantity: number }) => {
            const { productId, quantity } = props
            return updateCartItems({
                variables: {
                    items: [{ cart_item_id: productId, quantity }],
                },
            })
        },
        [updateCartItems]
    )

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
    const [applyCoupon, { error: applyingCouponError, loading: applyingCoupon }] = useMutation(APPLY_COUPON_MUTATION, {
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
    const [removeCoupon, { loading: removingCoupon, error: removingCouponError }] = useMutation(
        REMOVE_COUPON_MUTATION,
        {
            update(cache, { data: { removeCouponFromCart } }) {
                const { cart } = removeCouponFromCart
                cache.writeData({
                    data: { cart },
                })
            },
        }
    )

    const handleRemoveCoupon = useCallback(() => {
        return removeCoupon()
    }, [removeCoupon])

    return {
        ...query,
        updating,
        removing,
        applyingCoupon,
        removingCoupon,
        couponError: applyingCouponError?.message || removingCouponError?.message,
        api: {
            updateCartItem: handleUpdateCartItem,
            removeCartItem: handleRemoveCartItem,
            applyCoupon: handleApplyCoupon,
            removeCoupon: handleRemoveCoupon,
        },
    }
}
