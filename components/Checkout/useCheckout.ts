import { useCallback, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

import CHECKOUT_QUERY from './graphql/checkout.graphql'
import SET_GUEST_EMAIL_ADDRESS_MUTATION from './graphql/setGuestEmailOnCart.graphql'
import SET_SHIPPING_ADDRESSES_MUTATION from './graphql/setShippingAddressesOnCart.graphql'
import SET_SHIPPING_METHOD_MUTATION from './graphql/setShippingMethodOnCart.graphql'
import CREATE_BRAINTREE_TOKEN_MUTATION from './graphql/createBraintreeClientToken.graphql'
import SET_BILLING_ADDRESS_MUTATION from './graphql/setBillingAddressOnCart.graphql'
import SET_PAYMENT_METHOD_AND_ORDER_MUTATION from './graphql/setPaymentMethodAndOrder.graphql'

export const useCheckout = () => {
    /**
     * Data Query
     */
    const query = useQuery(CHECKOUT_QUERY, {
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
        variables: {
            hasCart: true, // @client
            cartId: '', // @client
        },
    })

    /**
     * Set Guest Email Address
     */
    const [setGuestEmailAddress, { loading: settingGuestEmailAddress }] = useMutation(
        SET_GUEST_EMAIL_ADDRESS_MUTATION,
        {
            update(cache, { data: { setGuestEmailOnCart } }) {
                const { cart } = setGuestEmailOnCart
                cache.writeData({
                    data: { cart },
                })
            },
        }
    )

    const handleSetGuestEmailAddress = useCallback((props: { emailAddress: string }) => {
        const { emailAddress } = props
        return setGuestEmailAddress({
            variables: {
                cartId: '', // @client
                emailAddress,
            },
        })
    }, [])

    /**
     * Set Shipping Address
     */
    const [setShippingAddress, { loading: settingShippingAddress }] = useMutation(SET_SHIPPING_ADDRESSES_MUTATION, {
        update(cache, { data: { setShippingAddressesOnCart } }) {
            const { cart } = setShippingAddressesOnCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleSetShippingAddress = useCallback(
        (props: {
            address: {
                city: string
                company?: string
                countryCode: string
                firstName: string
                lastName: string
                zipCode?: string
                region?: string
                saveInAddressBook: boolean
                street: string[]
                phoneNumber: string
            }
        }) => {
            const { address } = props

            const shippingAddress = {
                city: address.city,
                company: address.company,
                country_code: address.countryCode,
                firstname: address.firstName,
                lastname: address.lastName,
                postcode: address.zipCode,
                region: address.region,
                save_in_address_book: address.saveInAddressBook,
                street: address.street,
                telephone: address.phoneNumber,
            }

            return setShippingAddress({
                variables: {
                    cartId: '', // @client
                    shippingAddresses: [
                        {
                            address: shippingAddress,
                        },
                    ],
                },
            })
        },
        []
    )

    /**
     * Set Shipping Method
     */
    const [setShippingMethod, { loading: settingShippingMethod }] = useMutation(SET_SHIPPING_METHOD_MUTATION, {
        update(cache, { data: { setShippingMethodsOnCart } }) {
            const { cart } = setShippingMethodsOnCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleSetShippingMethod = useCallback((props: { methodCode: string }) => {
        const { methodCode } = props
        return setShippingMethod({
            variables: {
                cartId: '', // @client
                shippingMethods: [{ carrier_code: methodCode, method_code: methodCode }],
            },
        })
    }, [])

    /**
     * Set Billing Address
     */
    const [setBillingAddress, { loading: settingBillingAddress }] = useMutation(SET_BILLING_ADDRESS_MUTATION, {
        update(cache, { data: { setBillingAddressOnCart } }) {
            const { cart } = setBillingAddressOnCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleSetBillingAddress = useCallback(
        (props: {
            address: {
                city: string
                company?: string
                countryCode: string
                firstName: string
                lastName: string
                zipCode?: string
                region?: string
                saveInAddressBook: boolean
                street: string[]
                phoneNumber: string
            }
        }) => {
            const { address } = props

            const billingAddress = {
                city: address.city,
                company: address.company,
                country_code: address.countryCode,
                firstname: address.firstName,
                lastname: address.lastName,
                postcode: address.zipCode,
                region: address.region,
                save_in_address_book: address.saveInAddressBook,
                street: address.street,
                telephone: address.phoneNumber,
            }

            return setBillingAddress({
                variables: {
                    cartId: '', // @client
                    billingAddress: {
                        address: billingAddress,
                    },
                },
            })
        },
        []
    )

    /**
     * Create Braintree Token
     */
    const [createBraintreeToken] = useMutation(CREATE_BRAINTREE_TOKEN_MUTATION, {
        update(cache, { data: { braintreeToken } }) {
            cache.writeData({
                data: { cart: { braintreeToken, __typename: 'Cart' } },
            })
        },
    })

    useEffect(() => {
        createBraintreeToken()
    }, [])

    /**
     * TODO: Set Payment Method
     */
    const [setPaymentMethodAndOrder, { loading: settingPaymentMethodAndOrder }] = useMutation(
        SET_PAYMENT_METHOD_AND_ORDER_MUTATION,
        {
            update(cache, { data: { setPaymentMethodAndPlaceOrder } }) {
                const { order } = setPaymentMethodAndPlaceOrder
                cache.writeData({
                    data: { order, cart: null },
                })
            },
        }
    )

    const handleSetPaymentMethodAndOrder = useCallback((props: { nonce: string }) => {
        const { nonce } = props
        return setPaymentMethodAndOrder({
            variables: {
                cartId: '', // @client
                nonce,
            },
        })
    }, [])

    return {
        ...query,
        settingGuestEmailAddress,
        settingShippingAddress,
        settingShippingMethod,
        settingBillingAddress,
        settingPaymentMethodAndOrder,
        api: {
            setGuestEmailAddress: handleSetGuestEmailAddress,
            setShippingAddress: handleSetShippingAddress,
            setShippingMethod: handleSetShippingMethod,
            setBillingAddress: handleSetBillingAddress,
            setPaymentMethodAndOrder: handleSetPaymentMethodAndOrder,
        },
    }
}
