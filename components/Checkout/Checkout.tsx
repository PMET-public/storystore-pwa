import React, { FunctionComponent, useCallback, useState, useMemo, ChangeEvent, useEffect } from 'react'
import dynamic from 'next/dynamic'

import { useCheckout } from './useCheckout'
import { useCart } from '../Cart/useCart'
import { resolveImage } from '../../lib/resolveImage'

import useNetworkStatus from '../../hooks/useNetworkStatus'
import { useRouter } from 'next/router'

import CheckoutTemplate from '@pmet-public/luma-ui/dist/templates/Checkout'
import Link from '../Link'
import Head from '../Head'

const Error = dynamic(() => import('../Error'))

type CheckoutProps = {}

export const Checkout: FunctionComponent<CheckoutProps> = () => {
    const history = useRouter()

    const { loading, data, api, contactInfo, shippingMethods, paymentMethod, placeOrder } = useCheckout()

    const { applyingCoupon, removingCoupon, couponError, api: cartApi, data: cartData } = useCart()

    const { cart } = cartData || {}

    const { braintreeToken, countries } = data || {}

    const { email } = contactInfo.data?.cart || {}

    const shippingAddress = contactInfo.data?.cart?.shippingAddresses && contactInfo.data?.cart?.shippingAddresses[0]

    const { availableShippingMethods, selectedShippingMethod } =
        (shippingMethods.data?.cart?.shippingAddresses && shippingMethods.data?.cart?.shippingAddresses[0]) || {}

    /**
     * Redirect to Shopping Cart if empty
     */
    useEffect(() => {
        if (!data.hasCart || cart?.items.length === 0) history.push('/cart')
    }, [data, cart, history])

    /**
     * Steps
     */
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

    /**
     * Countries Data
     */
    const [selectedShippingCountryCode, setSelectedShippingCountryCode] = useState(
        shippingAddress?.country.code || 'US'
    )

    const selectedShippingCountryRegions = useMemo(() => {
        if (!countries) return null
        return countries.find((country: { code: string }) => country.code === selectedShippingCountryCode).regions
    }, [countries, selectedShippingCountryCode])

    /**
     * Contact Information
     */

    const handleSetContactInformation = useCallback(
        async formData => {
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
                saveInAddressBook = false,
            } = formData

            await api.setContactInfo({
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
            })

            setStep(2)
        },
        [api]
    )

    /**
     * Shipping Method
     */
    const handleSetShippingMethod = useCallback(
        async formData => {
            const { shippingMethod: methodCode } = formData

            await api.setShippingMethod({ methodCode })

            setStep(3)
        },
        [api]
    )

    /**
     * Payment Method
     */
    const handleSetPaymentMethod = useCallback(
        async formData => {
            const { nonce } = formData
            await api.setPaymentMethod({ nonce })
            setStep(4)
        },
        [api]
    )

    const handlePlaceOrder = useCallback(async () => {
        const { data } = await api.placeOrder()
        history.push(`/checkout/confirmation`, { orderId: data.placeOrder.order.id })
    }, [api, history])

    const online = useNetworkStatus()

    if (!online && !data) return <Error type="Offline" />

    return (
        <React.Fragment>
            <Head title="Checkout" />

            <CheckoutTemplate
                breadcrumbs={{
                    loading: false,
                    prefix: '#',
                    items: [
                        { text: 'Shopping Bag', as: Link, href: '/cart' },
                        { text: 'Checkout', as: Link, href: '/checkout' },
                    ],
                }}
                step={step}
                contactInfo={{
                    title: 'Contact Information',
                    edit: step < 2,
                    loading: contactInfo.loading,
                    submitting: contactInfo.settingContactInfo,
                    error: contactInfo.setContactInfoError,
                    fields: {
                        email: {
                            name: 'email',
                            label: 'Email',
                            defaultValue: email,
                        },
                        firstName: {
                            name: 'firstName',
                            label: 'First Name',
                            defaultValue: shippingAddress?.firstName,
                        },
                        lastName: {
                            name: 'lastName',
                            label: 'Last Name',
                            defaultValue: shippingAddress?.lastName,
                        },
                        company: {
                            name: 'company',
                            label: 'Company (optional)',
                            defaultValue: shippingAddress?.company,
                        },
                        address1: {
                            name: 'street[0]',
                            label: 'Address',
                            defaultValue: shippingAddress?.street[0],
                        },
                        address2: {
                            name: 'street[1]',
                            label: 'Apt, Suite, Unit, etc (optional)',
                            defaultValue: shippingAddress?.street[1],
                        },
                        city: {
                            name: 'city',
                            label: 'City',
                            defaultValue: shippingAddress?.city,
                        },
                        country: {
                            name: 'country',
                            label: 'Country',
                            defaultValue: selectedShippingCountryCode,
                            disabled: true, // US only for now
                            onChange: (e: ChangeEvent<HTMLSelectElement>) =>
                                setSelectedShippingCountryCode(e.currentTarget.value),
                            items: countries?.map((country: { name: string; code: string }) => ({
                                text: country.name,
                                value: country.code,
                            })),
                        },
                        region: {
                            name: 'region',
                            label: 'State',
                            defaultValue: shippingAddress?.region?.code,
                            ...(selectedShippingCountryRegions
                                ? {
                                      type: 'select',
                                      items: selectedShippingCountryRegions?.map(
                                          (region: { name: string; code: string }) => ({
                                              text: region.name,
                                              value: region.code,
                                          })
                                      ),
                                  }
                                : {
                                      type: 'text',
                                  }),
                        },
                        postalCode: {
                            name: 'postalCode',
                            label: 'Postal Code',
                            defaultValue: shippingAddress?.postalCode,
                        },
                        phone: {
                            name: 'phone',
                            label: 'Phone Number',
                            defaultValue: shippingAddress?.phone,
                        },
                    },
                    editButton: {
                        text: 'Edit',
                    },
                    submitButton: {
                        text: 'Continue to Shipping',
                    },
                    onEdit: () => setStep(1),
                    onSubmit: handleSetContactInformation,
                }}
                shippingMethod={{
                    title: 'Shipping Method',
                    edit: step < 3,
                    loading: shippingMethods.loading,
                    submitting: shippingMethods.settingShippingMethod,
                    error: shippingMethods.setShippingMethodError,
                    fields: {
                        shippingMethod: {
                            name: 'shippingMethod',
                            items: availableShippingMethods?.map(
                                ({ carrierTitle, methodTitle, methodCode, available, amount }: any) => ({
                                    text: `${carrierTitle} (${methodTitle}) ${amount.value.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: amount.currency,
                                    })}`,
                                    value: methodCode,
                                    defaultChecked: methodCode === selectedShippingMethod?.methodCode,
                                    disabled: !available,
                                })
                            ),
                        },
                    },
                    editButton: {
                        text: 'Edit',
                    },
                    submitButton: {
                        text: 'Continue to Payment',
                    },
                    onEdit: () => setStep(2),
                    onSubmit: handleSetShippingMethod,
                }}
                paymentMethod={{
                    title: 'Payment',
                    submitting: paymentMethod.settingPaymentMethod,
                    error: paymentMethod.setPaymentMethodError,
                    braintree: {
                        authorization: braintreeToken,
                        vaultManager: true,
                        preselectVaultedPaymentMethod: true,
                    },
                    editButton: {
                        text: 'Edit',
                    },
                    submitButton: {
                        text: 'Continue and Finish',
                    },
                    onSubmit: handleSetPaymentMethod,
                }}
                placeOrder={{
                    title: 'Finish',
                    loading,
                    submitting: placeOrder.placingOrder,
                    error: placeOrder.placeOrderError,
                    submitButton: {
                        text: 'Place Order',
                    },
                    onSubmit: handlePlaceOrder,
                }}
                list={{
                    loading: loading && !cart?.totalQuantity,
                    items: cart?.items?.map(({ id, quantity, price, product, options }: any, index: number) => ({
                        _id: id || index,
                        title: {
                            as: Link,
                            urlResolver: {
                                type: 'PRODUCT',
                                id,
                            },
                            href: `/${product.urlKey}`,
                            text: product.name,
                        },
                        sku: `SKU. ${product.sku}`,
                        thumbnail: {
                            as: Link,
                            urlResolver: {
                                type: 'PRODUCT',
                                id,
                            },
                            href: `/${product.urlKey}`,
                            alt: product.thumbnail.label,
                            src: resolveImage(product.thumbnail.url),
                        },
                        quantity: {
                            value: quantity,
                        },
                        price: {
                            currency: price.amount.currency,
                            regular: price.amount.value,
                        },
                        options: options?.map(({ id, label, value }: any) => ({
                            _id: id,
                            label,
                            value,
                        })),
                    })),
                }}
                summary={{
                    title: {
                        text: 'Bag Summary',
                    },
                    coupons: {
                        label: 'Apply Coupons',
                        open: !!cart?.appliedCoupons,
                        items: [
                            {
                                field: {
                                    label: 'Coupon Code',
                                    name: 'couponCode',
                                    error: couponError,
                                    disabled: !!cart?.appliedCoupons,
                                    defaultValue: cart?.appliedCoupons ? cart.appliedCoupons[0].code : undefined,
                                },
                                submitButton: {
                                    text: cart?.appliedCoupons ? 'Remove' : 'Apply',
                                    type: cart?.appliedCoupons ? 'reset' : 'submit',
                                },
                                submitting: applyingCoupon || removingCoupon,
                                onReset: () => {
                                    cartApi.removeCoupon()
                                },
                                onSubmit: (values: any) => {
                                    const { couponCode } = values
                                    cartApi.applyCoupon({ couponCode })
                                },
                            },
                        ],
                    },
                    prices: [
                        // Sub-total
                        {
                            label: 'Subtotal',
                            price: cart?.prices?.subTotal && {
                                currency: cart.prices.subTotal.currency,
                                regular: cart.prices.subTotal.value,
                            },
                        },

                        // Discounts
                        ...(cart?.prices?.discounts?.map((discount: any) => ({
                            label: discount.label,
                            price: {
                                currency: discount.amount.currency,
                                regular: -discount.amount.value,
                            },
                        })) || []),

                        // Shipping
                        ...(cart?.shippingAddresses
                            ?.filter(({ selectedShippingMethod }: any) => !!selectedShippingMethod)
                            .map(({ selectedShippingMethod }: any) => ({
                                label: `${selectedShippingMethod.carrierTitle} (${selectedShippingMethod.methodTitle})`,
                                price: {
                                    currency: selectedShippingMethod.amount.currency,
                                    regular: selectedShippingMethod.amount.value,
                                },
                            })) || []),

                        // Taxes
                        {
                            label: 'Estimated Taxes',
                            price: cart?.prices?.taxes[0] && {
                                currency: cart.prices.taxes[0] && cart.prices.taxes[0].currency,
                                regular: cart.prices.taxes.reduce(
                                    (accum: number, tax: { value: number }) => accum + tax.value,
                                    0
                                ),
                            },
                        },

                        // Total
                        {
                            appearance: 'bold',
                            label: 'Total',
                            price: cart?.prices?.total && {
                                currency: cart.prices.total.currency,
                                regular: cart.prices.total.value,
                            },
                        },
                    ],
                }}
            />
        </React.Fragment>
    )
}
