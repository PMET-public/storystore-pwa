import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks'
import { useValueUpdated } from './../../hooks/useValueUpdated'
import { useAppContext } from 'luma-ui/dist/AppProvider'

import CHECKOUT_QUERY from './graphql/checkout.graphql'
import GET_AVAILABLE_REGIONS_QUERY from './graphql/getAvailableRegions.graphql'
import SET_CONTACT_INFO_MUTATION from './graphql/setContactInfo.graphql'
import SET_SHIPPING_METHOD_MUTATION from './graphql/setShippingMethodOnCart.graphql'
import CREATE_BRAINTREE_TOKEN_MUTATION from './graphql/createBraintreeClientToken.graphql'
import RESET_CART_MUTATION from './graphql/resetCart.graphql'
import SET_PAYMENT_METHOD_AND_ORDER_MUTATION from './graphql/setPaymentMethodAndOrder.graphql'

export const useCheckout = () => {
    /**
     * Data Query
     */
    const query = useQuery(CHECKOUT_QUERY, {
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
    })

    /**
     * Refetch when back online
     */
    const {
        state: { online },
    } = useAppContext()

    useValueUpdated(() => {
        if (query.error && online) query.refetch()
    }, online)

    /**
     * Sorted Countries
     */
    const sortedCountries = useMemo(() => {
        return (
            query.data.countries &&
            query.data.countries
                .filter((x: any) => !!x.name)
                .sort(function compare(a: any, b: any) {
                    // Use toUpperCase() to ignore character casing
                    const genreA = a.name.toUpperCase()
                    const genreB = b.name.toUpperCase()

                    let comparison = 0
                    if (genreA > genreB) {
                        comparison = 1
                    } else if (genreA < genreB) {
                        comparison = -1
                    }
                    return comparison
                })
        )
    }, [query.data && query.data.countries])

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
        const { code } = address.country
        if (code) handleGetAvailableRegions({ countryCode: code })
    }, [
        handleGetAvailableRegions,
        query.data.cart && query.data.cart.shippingAddresses && query.data.cart.shippingAddresses[0].country.code,
    ])

    /**
     * Set Contact Info
     */
    const [setContactInfo, { loading: settingContactInfo }] = useMutation(SET_CONTACT_INFO_MUTATION, {
        update(cache, { data: { email, address } }) {
            const cart = { ...email.cart, ...address.cart }

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
                shippingMethods: [{ carrier_code: methodCode, method_code: methodCode }],
            },
        })
    }, [])

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
     * Set Payment Method
     */
    const [resetCart] = useMutation(RESET_CART_MUTATION)

    const [setPaymentAndOrderMethod, { loading: settingPaymentAndOrderMethod }] = useMutation(
        SET_PAYMENT_METHOD_AND_ORDER_MUTATION
    )

    const handleSetPaymentMethodAndOrder = useCallback(async (props: { nonce: string }) => {
        const { nonce } = props

        const res = await setPaymentAndOrderMethod({
            variables: { nonce },
        })

        await resetCart()

        return res
    }, [])

    return {
        ...query,
        online,
        data: {
            ...query.data,
            availableRegions,
            countries: sortedCountries,
        },
        gettingAvailableRegions,
        settingContactInfo,
        settingShippingMethod,
        settingPaymentAndOrderMethod,
        api: {
            getAvailableRegions: handleGetAvailableRegions,
            setShippingMethod: handleSetShippingMethod,
            setContactInfo: handleSetContactInfo,
            setPaymentMethodAndOrder: handleSetPaymentMethodAndOrder,
        },
    }
}
