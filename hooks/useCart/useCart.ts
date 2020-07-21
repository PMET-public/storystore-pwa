import { useCallback } from 'react'
import { useMutation, gql } from '@apollo/client'

import CREATE_CART_MUTATION from './graphql/createCart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './graphql/updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './graphql/removeCartItem.graphql'
import APPLY_COUPON_MUTATION from './graphql/applyCoupon.graphql'
import REMOVE_COUPON_MUTATION from './graphql/removeCoupon.graphql'
import ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION from './graphql/addSimpleProductsToCart.graphql'
import ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION from './graphql/addConfigurableProductsToCart.graphql'

type UseCart = {
    cartId?: string
}

export const useCart = (options: UseCart = {}) => {
    const { cartId } = options

    /**
     * Handle Creating a New Cart
     */
    const [createCart, creatingCart] = useMutation(CREATE_CART_MUTATION, {
        // TODO: Do I still need this here?
        // refetchQueries: ({ data }) => [{ query: CART_QUERY, variables: { cartId: data.cartId } }],
    })

    const handleCreateCart = useCallback(async () => {
        const {
            data: { cartId },
        } = await createCart()

        return cartId
    }, [createCart])

    /**
     * Handle Update Cart Item Action
     */
    const [updateCartItem, updatingCartItem] = useMutation(UPDATE_CART_ITEMS_MUTATION, {
        update(client, { data: { updateCartItems } }) {
            const { cart } = updateCartItems

            client.writeQuery({
                query: gql`
                    query Cart {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleUpdateCartItem = useCallback(
        (props: { productId: number; quantity: number }) => {
            const { productId, quantity } = props
            return updateCartItem({
                variables: {
                    cartId,
                    items: [{ cart_item_id: productId, quantity }],
                },
            })
        },
        [cartId, updateCartItem]
    )

    /**
     * Handle Remove Cart Item Action
     */
    const [removeCartItem, removingCartItem] = useMutation(REMOVE_CART_ITEM_MUTATION, {
        update(client, { data: { removeItemFromCart } }) {
            const { cart } = removeItemFromCart

            client.writeQuery({
                query: gql`
                    query Cart {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleRemoveCartItem = useCallback(
        (props: { cartId: string; productId: number }) => {
            const { cartId, productId } = props
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
        update(client, { data: { applyCouponToCart } }) {
            const { cart } = applyCouponToCart

            client.writeQuery({
                query: gql`
                    query Cart {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleApplyCoupon = useCallback(
        (props: { cartId: string; couponCode: string }) => {
            const { cartId, couponCode } = props
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
        update(client, { data: { removeCouponFromCart } }) {
            const { cart } = removeCouponFromCart

            client.writeQuery({
                query: gql`
                    query Cart {
                        cart
                    }
                `,
                data: {
                    cart,
                },
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
     * Handle Add To Cart Configurable Product
     */
    const [addConfigurableProductsToCart, addingConfigurableProductToCart] = useMutation(ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION, {
        update(client, { data: { addToCart } }) {
            const { cart } = addToCart

            client.writeQuery({
                query: gql`
                    query Cart {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleAddConfigurableProductToCart = useCallback(
        async (variables: { quantity: number; sku: string; variantSku: string }) => {
            const { sku, variantSku, quantity } = variables
            const { data } = await addConfigurableProductsToCart({
                variables: {
                    cartId,
                    parentSku: sku,
                    sku: variantSku,
                    quantity,
                },
            })
            return data
        },
        [cartId, addConfigurableProductsToCart]
    )

    /**
     * Handle Add To Cart Simple Product
     */
    const [addSimpleProductsToCart, addingSimpleProductsToCart] = useMutation(ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION, {
        update(client, { data: { addToCart } }) {
            const { cart } = addToCart

            client.writeQuery({
                query: gql`
                    query Cart {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleAddSimpleProductToCart = useCallback(
        async (variables: { sku: string; quantity: number }) => {
            const { sku, quantity } = variables
            const { data } = await addSimpleProductsToCart({
                variables: {
                    cartId,
                    sku,
                    quantity,
                },
            })
            return data
        },
        [cartId, addSimpleProductsToCart]
    )

    return {
        createCart: handleCreateCart,
        creatingCart,
        updateCartItem: handleUpdateCartItem,
        updatingCartItem,
        removeCartItem: handleRemoveCartItem,
        removingCartItem,
        applyCoupon: handleApplyCoupon,
        applyingCoupon,
        removeCoupon: handleRemoveCoupon,
        removingCoupon,
        addSimpleProductToCart: handleAddSimpleProductToCart,
        addingSimpleProductsToCart,
        addConfigurableProductToCart: handleAddConfigurableProductToCart,
        addingConfigurableProductToCart,
    }
}
