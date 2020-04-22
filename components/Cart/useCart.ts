import { queryDefaultOptions } from '~/lib/apollo/client'
import { useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

import CART_QUERY from './graphql/cart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './graphql/updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './graphql/removeCartItem.graphql'
import APPLY_COUPON_MUTATION from './graphql/applyCoupon.graphql'
import REMOVE_COUPON_MUTATION from './graphql/removeCoupon.graphql'
import CREATE_CART_MUTATION from './graphql/createCart.graphql'

type UseCart = {
    cartId?: string
}

export const useCart = (props: UseCart = {}) => {
    const { cartId } = props

    /**
     * Data Query
     */
    const cart = useQuery(CART_QUERY, {
        ...queryDefaultOptions,
        errorPolicy: 'none',
        variables: {
            cartId,
        },
        skip: !cartId,
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
        (props: { cartId: string; productId: number; quantity: number }) => {
            const { cartId, productId, quantity } = props
            return updateCartItem({
                variables: {
                    cartId,
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
        (props: { cartId: string; productId: number }) => {
            const { productId } = props
            return removeCartItem({
                variables: {
                    cartId,
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
        (props: { cartId: string; couponCode: string }) => {
            const { couponCode } = props
            return applyCoupon({
                variables: {
                    cartId,
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

    const handleRemoveCoupon = useCallback(
        (props: { cartId: string }) => {
            const { cartId } = props
            return removeCoupon({
                variables: {
                    cartId,
                },
            })
        },
        [removeCoupon]
    )

    /**
     * Handle Creating a New Cart
     */

    const [createCart, creatingCart] = useMutation(CREATE_CART_MUTATION)

    const handleCreateCart = useCallback(async (cb?: (cartId: string) => any) => {
        const { data } = await createCart()
        if (typeof cb === 'function') cb(data.cartId)
    }, [])

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
            createCart: handleCreateCart,
            creatingCart,
        },
    }
}
