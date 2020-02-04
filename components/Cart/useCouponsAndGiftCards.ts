import { useMutation } from '@apollo/react-hooks'
import { useCallback, useMemo } from 'react'

import APPLY_COUPON_MUTATION from './graphql/applyCoupon.graphql'
import REMOVE_COUPON_MUTATION from './graphql/removeCoupon.graphql'

export const useCouponsAndGiftCards = () => {
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

    const handleApplyCoupon = useCallback((props: { couponCode: string }) => {
        const { couponCode } = props
        return applyCoupon({
            variables: {
                couponCode,
            },
        })
    }, [])

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
    }, [])

    const couponError = useMemo(() => {
        if (applyingCouponError)
            return {
                message: applyingCouponError.graphQLErrors[0]?.message,
            }

        if (removingCouponError) {
            return {
                message: removingCouponError.graphQLErrors[0]?.message,
            }
        }

        return
    }, [applyingCouponError, removingCouponError])

    return {
        applyingCoupon,
        removingCoupon,
        couponError,
        api: {
            applyCoupon: handleApplyCoupon,
            removeCoupon: handleRemoveCoupon,
        },
    }
}
