import { useCallback, useEffect } from 'react'
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks'

import CHECKOUT_QUERY from './graphql/checkout.graphql'
import GET_AVAILABLE_REGIONS_QUERY from './graphql/getAvailableRegions.graphql'
import SET_GUEST_EMAIL_ADDRESS_MUTATION from './graphql/setGuestEmailOnCart.graphql'
import SET_SHIPPING_ADDRESSES_MUTATION from './graphql/setShippingAddressesOnCart.graphql'
import SET_SHIPPING_METHOD_MUTATION from './graphql/setShippingMethodOnCart.graphql'
import CREATE_BRAINTREE_TOKEN_MUTATION from './graphql/createBraintreeClientToken.graphql'
import SET_BILLING_ADDRESS_MUTATION from './graphql/setBillingAddressOnCart.graphql'
import SET_PAYMENT_METHOD_MUTATION from './graphql/setPaymentMethod.graphql'
import PLACE_ORDER_MUTATION from './graphql/placeOrder.graphql'

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
     * Get Available Regions
     */
    const [getAvailableRegions, { loading: gettingAvailableRegions, data: availableRegions }] = useLazyQuery(
        GET_AVAILABLE_REGIONS_QUERY,
        {
            fetchPolicy: 'cache-first',
        }
    )

    const handleGetAvailableRegions = useCallback((props: { countryCode: string }) => {
        const { countryCode } = props
        return getAvailableRegions({
            variables: {
                id: countryCode,
            },
        })
    }, [])

    useEffect(() => {
        if (!query.data.cart || !query.data.cart.shippingAddresses) return
        const [address] = query.data.cart.shippingAddresses
        handleGetAvailableRegions({ countryCode: address.country.code })
    }, [
        handleGetAvailableRegions,
        query.data.cart && query.data.cart.shippingAddresses && query.data.cart.shippingAddresses[0].country.code,
    ])

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

            const {
                city,
                company,
                countryCode,
                firstName,
                lastName,
                zipCode,
                region,
                saveInAddressBook,
                street,
                phoneNumber,
            } = address

            const billingAddress = {
                city: city,
                company: company,
                country_code: countryCode,
                firstname: firstName,
                lastname: lastName,
                postcode: zipCode,
                region: region,
                save_in_address_book: saveInAddressBook,
                street: street,
                telephone: phoneNumber,
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
    const [setPaymentMethod, { loading: settingPaymentMethod }] = useMutation(SET_PAYMENT_METHOD_MUTATION, {
        update(cache, { data: { setPaymentMethodOnCart } }) {
            const { cart } = setPaymentMethodOnCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleSetPaymentMethod = useCallback((props: { nonce: string }) => {
        const { nonce } = props
        return setPaymentMethod({
            variables: {
                cartId: '', // @client
                nonce,
            },
        })
    }, [])

    /**
     * Place Order
     */
    const [placeOrder, { loading: placingOrder }] = useMutation(PLACE_ORDER_MUTATION, {
        update(cache) {
            // Reset Cart
            cache.writeData({
                data: { cart: null },
            })
        },
    })

    const handlePlaceOrder = useCallback(() => {
        return placeOrder({
            variables: {
                cartId: '', // @client
            },
        })
    }, [])

    return {
        ...query,
        data: {
            ...query.data,
            availableRegions,
        },
        settingGuestEmailAddress,
        gettingAvailableRegions,
        settingShippingAddress,
        settingShippingMethod,
        settingBillingAddress,
        settingPaymentMethod,
        placingOrder,
        api: {
            setGuestEmailAddress: handleSetGuestEmailAddress,
            getAvailableRegions: handleGetAvailableRegions,
            setShippingAddress: handleSetShippingAddress,
            setShippingMethod: handleSetShippingMethod,
            setBillingAddress: handleSetBillingAddress,
            setPaymentMethod: handleSetPaymentMethod,
            placeOrder: handlePlaceOrder,
        },
    }
}
