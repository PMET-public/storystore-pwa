import { useCallback } from 'react'
import { useMutation, gql } from '@apollo/client'

import CREATE_CART_MUTATION from './graphql/createCart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './graphql/updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './graphql/removeCartItem.graphql'
import APPLY_COUPON_MUTATION from './graphql/applyCoupon.graphql'
import REMOVE_COUPON_MUTATION from './graphql/removeCoupon.graphql'
import ADD_PRODUCTS_TO_CART from './graphql/addProductsToCart.graphql'
import ADD_BUNDLE_PRODUCT_TO_CART from './graphql/addBundleProductToCart.graphql'
import ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION from './graphql/addSimpleProductsToCart.graphql'
import ADD_VIRTUAL_PRODUCTS_TO_CART_MUTATION from './graphql/addVirtualProductsToCart.graphql'
import ADD_DOWNLOADABLE_PRODUCTS_TO_CART_MUTATION from './graphql/addDownloadableProductsToCart.graphql'
import ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION from './graphql/addConfigurableProductsToCart.graphql'
import CREATE_BRAINTREE_TOKEN_MUTATION from './graphql/createBraintreeClientToken.graphql'
import SET_CONTACT_INFO_MUTATION from './graphql/setContactInfo.graphql'
import SET_SHIPPING_METHOD_MUTATION from './graphql/setShippingMethod.graphql'
import SET_PAYMENT_METHOD_MUTATION from './graphql/setPaymentMethod.graphql'
import PLACE_ORDER_MUTATION from './graphql/placeOrder.graphql'
import { CART_QUERY } from '~/components/Cart'

type UseCart = {
    cartId?: string
}

export const useCart = (options: UseCart = {}) => {
    const { cartId } = options

    /**
     * Handle Creating a New Cart
     */
    const [createCart, creatingCart] = useMutation(CREATE_CART_MUTATION, {
        refetchQueries: ({ data }) => [{ query: CART_QUERY, variables: { cartId: data.cartId } }],
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
                    query CartUpdateItem {
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
                    query CartRemoveItem {
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
        (props: { productId: number }) => {
            const { productId } = props
            return removeCartItem({
                variables: {
                    cartId,
                    itemId: productId,
                },
            })
        },
        [cartId, removeCartItem]
    )

    /**
     * Handle Apply Coupon Code
     */
    const [applyCoupon, applyingCoupon] = useMutation(APPLY_COUPON_MUTATION, {
        update(client, { data: { applyCouponToCart } }) {
            const { cart } = applyCouponToCart

            client.writeQuery({
                query: gql`
                    query CartApplyCoupon {
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
        (props: { couponCode: string }) => {
            const { couponCode } = props
            return applyCoupon({
                variables: {
                    cartId,
                    couponCode,
                },
            })
        },
        [cartId, applyCoupon]
    )

    /**
     * Handle Apply Coupon Code
     */
    const [removeCoupon, removingCoupon] = useMutation(REMOVE_COUPON_MUTATION, {
        update(client, { data: { removeCouponFromCart } }) {
            const { cart } = removeCouponFromCart

            client.writeQuery({
                query: gql`
                    query CartRemoveCoupon {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleRemoveCoupon = useCallback(() => {
        return removeCoupon({
            variables: {
                cartId,
            },
        })
    }, [cartId, removeCoupon])

    /**
     * Handle Add Product To Cart
     */
    const [addProductsToCart, addingProductsToCart] = useMutation(ADD_PRODUCTS_TO_CART, {
        update(client, { data: { addToCart } }) {
            const { cart } = addToCart

            client.writeQuery({
                query: gql`
                    query CartAddConfigurableProducts {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleAddProductsToCart = useCallback(
        async (
            items: Array<{
                sku: string
                quantity: number
                parentSku?: string
                entered_options?: { uid: string; value: string }
                selected_options?: string[]
            }>
        ) => {
            const { data } = await addProductsToCart({
                variables: {
                    cartId,
                    items,
                },
            })
            return data
        },
        [cartId, addProductsToCart]
    )

    /**
     * Handle Add to Cart Bundle Product
     * Note: It's not clear (https://devdocs.magento.com/guides/v2.4/graphql/mutations/add-products-to-cart.html)
     * how to add Bundle Products using the new AddProductsToCart mutation.
     */
    const [addBundleProductsToCart, addingBundleProductsToCart] = useMutation(ADD_BUNDLE_PRODUCT_TO_CART, {
        update(client, { data: { addToCart } }) {
            const { cart } = addToCart

            client.writeQuery({
                query: gql`
                    query CartAddConfigurableProducts {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleAddBundleProductsToCart = useCallback(
        async (variables: {
            items: Array<{
                data: {
                    quantity: number
                    sku: string
                }
                bundle_options: Array<{
                    id: number
                    quantity: number
                    value: Array<string>
                }>
            }>
        }) => {
            const { data } = await addBundleProductsToCart({
                variables: {
                    cartId,
                    ...variables,
                },
            })
            return data
        },
        [cartId, addBundleProductsToCart]
    )

    /**
     * Handle Add To Cart Configurable Product
     */
    const [addConfigurableProductsToCart, addingConfigurableProductToCart] = useMutation(ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION, {
        update(client, { data: { addToCart } }) {
            const { cart } = addToCart

            client.writeQuery({
                query: gql`
                    query CartAddConfigurableProducts {
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
                    query CartAddSimpleProducts {
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
        async (items: Array<{ data: { sku: string; quantity: number } }>) => {
            const { data } = await addSimpleProductsToCart({
                variables: {
                    cartId,
                    items,
                },
            })
            return data
        },
        [cartId, addSimpleProductsToCart]
    )

    /**
     * Handle Add To Virtual Product
     */
    const [addVirtualProductsToCart, addingVirtualProductsToCart] = useMutation(ADD_VIRTUAL_PRODUCTS_TO_CART_MUTATION, {
        update(client, { data: { addToCart } }) {
            const { cart } = addToCart

            client.writeQuery({
                query: gql`
                    query CartAddSimpleProducts {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleAddVirtualProductToCart = useCallback(
        async (variables: { sku: string; quantity: number }) => {
            const { sku, quantity } = variables
            const { data } = await addVirtualProductsToCart({
                variables: {
                    cartId,
                    sku,
                    quantity,
                },
            })
            return data
        },
        [cartId, addVirtualProductsToCart]
    )

    /**
     * Handle Add To Downloadable Product
     */
    const [addDownloadableProductsToCart, addingDownloadableProductToCart] = useMutation(ADD_DOWNLOADABLE_PRODUCTS_TO_CART_MUTATION, {
        update(client, { data: { addToCart } }) {
            const { cart } = addToCart

            client.writeQuery({
                query: gql`
                    query CartAddSimpleProducts {
                        cart
                    }
                `,
                data: {
                    cart,
                },
            })
        },
    })

    const handleAddDownloadableProductToCart = useCallback(
        async (items: Array<{ data: { sku: string; quantity: number } }>) => {
            const { data } = await addDownloadableProductsToCart({
                variables: {
                    cartId,
                    items,
                },
            })
            return data
        },
        [cartId, addDownloadableProductsToCart]
    )

    /**
     * Create Braintree Token
     */
    const [createBraintreeToken, creatingBraintreeToken] = useMutation(CREATE_BRAINTREE_TOKEN_MUTATION)

    const handleCreateBraintreeToken = useCallback(async () => {
        const { data } = await createBraintreeToken()
        return data
    }, [createBraintreeToken])

    /**
     * Contact Info
     */
    const [setContactInfo, settingContactInfo] = useMutation(SET_CONTACT_INFO_MUTATION, {
        update(client, { data: { billingAddress } }) {
            const { cart } = billingAddress

            client.writeQuery({
                query: gql`
                    query CartSetContactInfo {
                        cart
                    }
                `,
                data: { cart },
            })
        },
    })

    const handleSetContactInfo = useCallback(
        (props: {
            email: string
            city: string
            company?: string
            country: string
            firstName: string
            lastName: string
            postalCode?: string
            region?: string
            street: [string, string?]
            phone: string
            saveInAddressBook: boolean
        }) => {
            const { email, city, company, country, firstName, lastName, postalCode, region, street, phone, saveInAddressBook } = props
            return setContactInfo({
                variables: {
                    cartId,
                    email: email,
                    address: {
                        city: city,
                        company: company,
                        country_code: country,
                        firstname: firstName,
                        lastname: lastName,
                        postcode: postalCode,
                        region: region,
                        save_in_address_book: saveInAddressBook,
                        street: street,
                        telephone: phone,
                    },
                },
            })
        },
        [setContactInfo, cartId]
    )

    /**
     * Shipping Methods
     */
    const [setShippingMethod, settingShippingMethod] = useMutation(SET_SHIPPING_METHOD_MUTATION, {
        update(client, { data: { setShippingMethodsOnCart } }) {
            const { cart } = setShippingMethodsOnCart

            client.writeQuery({
                query: gql`
                    query CartSetShippingMethod {
                        cart
                    }
                `,
                data: { cart },
            })
        },
    })

    const handleSetShippingMethod = useCallback(
        (props: { methodCode: string; carrierCode: string }) => {
            const { methodCode, carrierCode } = props
            return setShippingMethod({
                variables: {
                    cartId,
                    shippingMethods: [{ carrier_code: carrierCode, method_code: methodCode }],
                },
            })
        },
        [setShippingMethod, cartId]
    )

    /**
     * Payment Method
     */
    const [setPaymentMethod, settingPaymentMethod] = useMutation(SET_PAYMENT_METHOD_MUTATION)

    const handleSetPaymentMethod = useCallback(
        async (props: { nonce: string }) => {
            const { nonce } = props

            return await setPaymentMethod({
                variables: { cartId, nonce },
            })
        },
        [setPaymentMethod, cartId]
    )

    /**
     * Place Order
     */
    const [placeOrder, placingOrder] = useMutation(PLACE_ORDER_MUTATION)

    const handlePlaceOrder = useCallback(async () => {
        const { data } = await placeOrder({ variables: { cartId } })
        return data.placeOrder?.order
    }, [placeOrder, cartId])

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
        addProductsToCart: handleAddProductsToCart,
        addingProductsToCart,
        addBundleProductsToCart: handleAddBundleProductsToCart,
        addingBundleProductsToCart,

        /** TODO: Deprecate Below */
        addSimpleProductToCart: handleAddSimpleProductToCart,
        addingSimpleProductsToCart,
        addConfigurableProductToCart: handleAddConfigurableProductToCart,
        addingConfigurableProductToCart,
        addVirtualProductToCart: handleAddVirtualProductToCart,
        addingVirtualProductsToCart,
        addDownloadableProductToCart: handleAddDownloadableProductToCart,
        addingDownloadableProductToCart,
        createBraintreeToken: handleCreateBraintreeToken,
        creatingBraintreeToken,
        setContactInfo: handleSetContactInfo,
        settingContactInfo,
        setShippingMethod: handleSetShippingMethod,
        settingShippingMethod,
        setPaymentMethod: handleSetPaymentMethod,
        settingPaymentMethod,
        placeOrder: handlePlaceOrder,
        placingOrder,
    }
}
