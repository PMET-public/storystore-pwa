import { useCart } from '~/hooks/useCart/useCart'
import { useCallback, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'

import CHECKOUT_QUERY from './graphql/checkout.graphql'

import CREATE_BRAINTREE_TOKEN_MUTATION from './graphql/createBraintreeClientToken.graphql'

import CONTACT_INFO_QUERY from './graphql/contactInfo.graphql'
import SET_CONTACT_INFO_MUTATION from './graphql/setContactInfo.graphql'

import SHIPPING_METHODS_QUERY from './graphql/shippingMethods.graphql'
import SET_SHIPPING_METHOD_MUTATION from './graphql/setShippingMethodOnCart.graphql'

import SELECTED_PAYMENT_METHOD_QUERY from './graphql/selectedPaymentMethod.graphql'
import SET_PAYMENT_METHOD_MUTATION from './graphql/setPaymentMethodOnCart.graphql'

import PLACE_ORDER_MUTATION from './graphql/placeOrder.graphql'

type UseCheckout = {
    cartId: string
}

export const useCheckout = (props: UseCheckout) => {
    const { cartId } = props
    /**
     * Data Query
     */
    const checkout = useQuery(CHECKOUT_QUERY)

    /**
     * Cart
     */
    const {
        api: { createCart, creatingCart, applyCoupon, applyingCoupon, removeCoupon, removingCoupon },
        ...cart
    } = useCart({ cartId })

    /**
     * Create Braintree Token
     */
    const [createBraintreeToken] = useMutation(CREATE_BRAINTREE_TOKEN_MUTATION, {
        update(cache, { data: { braintreeToken } }) {
            cache.writeData({
                data: { braintreeToken },
            })
        },
    })

    useEffect(() => {
        createBraintreeToken()
    }, [createBraintreeToken])

    /**
     * Contact Info
     */

    const contactInfo = useQuery(CONTACT_INFO_QUERY, {
        variables: { cartId },
        fetchPolicy: 'no-cache',
    })

    const [setContactInfo, settingContactInfo] = useMutation(SET_CONTACT_INFO_MUTATION, {
        update(cache, { data: { billingAddress } }) {
            const { cart } = billingAddress
            cache.writeData({
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
    const shippingMethods = useQuery(SHIPPING_METHODS_QUERY, {
        variables: { cartId },
    })

    const [setShippingMethod, settingShippingMethod] = useMutation(SET_SHIPPING_METHOD_MUTATION, {
        update(cache, { data: { setShippingMethodsOnCart } }) {
            const { cart } = setShippingMethodsOnCart
            cache.writeData({
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
     * Selected Payment Method
     */
    const paymentMethod = useQuery(SELECTED_PAYMENT_METHOD_QUERY, {
        variables: { cartId },
    })

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
        queries: {
            checkout,
            contactInfo,
            shippingMethods,
            paymentMethod,
            placeOrder,
            cart,
        },
        api: {
            setContactInfo: handleSetContactInfo,
            settingContactInfo,
            setShippingMethod: handleSetShippingMethod,
            settingShippingMethod,
            setPaymentMethod: handleSetPaymentMethod,
            settingPaymentMethod,
            placeOrder: handlePlaceOrder,
            placingOrder,
            applyCoupon,
            applyingCoupon,
            removeCoupon,
            removingCoupon,
            createCart,
            creatingCart,
        },
    }
}
