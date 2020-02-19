import { writeInLocalStorage } from '../../lib/localStorage'
import { useCallback, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { queryDefaultOptions } from '../../apollo/client'

import CHECKOUT_QUERY from './graphql/checkout.graphql'
import RESET_CART_MUTATION from './graphql/resetCart.graphql'

import CONTACT_INFO_QUERY from './graphql/contactInfo.graphql'
import SET_CONTACT_INFO_MUTATION from './graphql/setContactInfo.graphql'

import SHIPPING_METHODS_QUERY from './graphql/shippingMethods.graphql'
import SET_SHIPPING_METHOD_MUTATION from './graphql/setShippingMethodOnCart.graphql'

import CREATE_BRAINTREE_TOKEN_MUTATION from './graphql/createBraintreeClientToken.graphql'
import SELECTED_PAYMENT_METHOD_QUERY from './graphql/selectedPaymentMethod.graphql'
import SET_PAYMENT_METHOD_MUTATION from './graphql/setPaymentMethodOnCart.graphql'

import PLACE_ORDER_MUTATION from './graphql/placeOrder.graphql'

export const useCheckout = () => {
    /**
     * Data Query
     */
    const query = useQuery(CHECKOUT_QUERY, {
        // This data is cached by default.
        // Do not include any sensitive data in this query
        ...queryDefaultOptions,
    })

    /**
     * Contact Info
     */

    const contactInfo = useQuery(CONTACT_INFO_QUERY, {
        ...queryDefaultOptions,
        fetchPolicy: 'no-cache',
    })

    const [setContactInfo, { loading: settingContactInfo, error: setContactInfoError }] = useMutation(
        SET_CONTACT_INFO_MUTATION,
        {
            update(cache, { data: { email, billingAddress } }) {
                const cart = { ...email.cart, ...billingAddress.cart }
                cache.writeData({
                    data: { cart },
                })
            },
        }
    )

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
            const {
                email,
                city,
                company,
                country,
                firstName,
                lastName,
                postalCode,
                region,
                street,
                phone,
                saveInAddressBook,
            } = props
            return setContactInfo({
                variables: {
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
        []
    )

    /**
     * Shipping Methods
     */
    const shippingMethods = useQuery(SHIPPING_METHODS_QUERY, {
        ...queryDefaultOptions,
        fetchPolicy: 'no-cache',
    })

    const [setShippingMethod, { loading: settingShippingMethod, error: setShippingMethodError }] = useMutation(
        SET_SHIPPING_METHOD_MUTATION,
        {
            update(cache, { data: { setShippingMethodsOnCart } }) {
                const { cart } = setShippingMethodsOnCart
                cache.writeData({
                    data: { cart },
                })
            },
        }
    )

    const handleSetShippingMethod = useCallback((props: { methodCode: string }) => {
        const { methodCode } = props
        return setShippingMethod({
            variables: {
                shippingMethods: [{ carrier_code: methodCode, method_code: methodCode }],
            },
        })
    }, [])

    /**
     * Selected Payment Method
     */
    const paymentMethod = useQuery(SELECTED_PAYMENT_METHOD_QUERY, {
        ...queryDefaultOptions,
        fetchPolicy: 'no-cache',
    })

    const [createBraintreeToken] = useMutation(CREATE_BRAINTREE_TOKEN_MUTATION, {
        update(cache, { data: { braintreeToken } }) {
            cache.writeData({
                data: { braintreeToken },
            })
        },
    })

    useEffect(() => {
        createBraintreeToken()
    }, [])

    const [setPaymentMethod, { loading: settingPaymentMethod, error: setPaymentMethodError }] = useMutation(
        SET_PAYMENT_METHOD_MUTATION
    )

    const handleSetPaymentMethod = useCallback(async (props: { nonce: string }) => {
        const { nonce } = props

        return await setPaymentMethod({
            variables: { nonce },
        })
    }, [])

    /**
     * Place Order
     */
    const [resetCart] = useMutation(RESET_CART_MUTATION, {
        update: (cache, { data: { cartId } }) => {
            writeInLocalStorage('cartId', cartId)

            cache.writeData({
                data: { cartId },
            })
        },
    })

    const [placeOrder, { loading: placingOrder, error: placeOrderError }] = useMutation(PLACE_ORDER_MUTATION, {})

    const handlePlaceOrder = useCallback(async () => {
        const res = await placeOrder()
        await resetCart()
        return res
    }, [])

    return {
        ...query,
        contactInfo: {
            ...contactInfo,
            settingContactInfo,
            setContactInfoError: setContactInfoError?.graphQLErrors[0].message,
        },
        shippingMethods: {
            ...shippingMethods,
            settingShippingMethod,
            setShippingMethodError: setShippingMethodError?.graphQLErrors[0].message,
        },
        paymentMethod: {
            ...paymentMethod,
            settingPaymentMethod,
            setPaymentMethodError: setPaymentMethodError?.graphQLErrors[0].message,
        },
        placeOrder: {
            placingOrder,
            placeOrderError: placeOrderError?.graphQLErrors[0].message,
        },
        api: {
            setShippingMethod: handleSetShippingMethod,
            setContactInfo: handleSetContactInfo,
            setPaymentMethod: handleSetPaymentMethod,
            placeOrder: handlePlaceOrder,
        },
    }
}
