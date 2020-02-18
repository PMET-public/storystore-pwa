import React, { FunctionComponent, useCallback, useState, useEffect, useMemo, ChangeEvent } from 'react'

import { useCheckout } from './useCheckout'
import { useCart } from '../Cart/useCart'
import { resolveImage } from '../../lib/resolveImage'
import { useRouter } from 'next/router'
import useNetworkStatus from '../../hooks/useNetworkStatus'
import dynamic from 'next/dynamic'

import DocumentMetadata from '../DocumentMetadata'
import CheckoutTemplate from '@pmet-public/luma-ui/dist/templates/Checkout'
import Link from '../Link'

const Error = dynamic(() => import('../Error'))

type CheckoutProps = {}

export const Checkout: FunctionComponent<CheckoutProps> = ({}) => {
    const {
        loading,
        data,
        api,
        settingContactInfo,
        setContactInfoError,
        settingShippingMethod,
        setShippingMethodError,
        settingPaymentMethod,
        setPaymentMethodError,
        placingOrder,
        placeOrderError,
    } = useCheckout()

    const { applyingCoupon, removingCoupon, couponError, api: cartApi } = useCart()

    const router = useRouter()

    /**
     * Steps
     */
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

    useEffect(() => {
        /** Prefetch Confirmation Page */
        router.prefetch('/checkout/confirmation')
    }, [])

    /**
     * Redirect to Shopping Cart if empty
     */
    useEffect(() => {
        if (data && data.cart && data.cart.items.length === 0) router.push('/cart').then(() => window.scrollTo(0, 0))
    }, [data && data.cart])

    /**
     * Countries Data
     */
    const [selectedShippingCountryCode, setSelectedShippingCountryCode] = useState(
        (data && data.cart && data.cart.shippingAddress && data.cart.shippingAddress?.country.code) || 'US'
    )

    const selectedShippingCountryRegions = useMemo(() => {
        if (!(data && data.countries)) return null
        return data.countries.find((country: { code: string }) => country.code === selectedShippingCountryCode).regions
    }, [data && data.countries, selectedShippingCountryCode])

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
        [api.setContactInfo]
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
        [api.setShippingMethod]
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
        [api.setPaymentMethod]
    )

    const handlePlaceOrder = useCallback(async () => {
        const { data } = await api.placeOrder()
        router.push(`/checkout/confirmation?order=${data.placeOrder.order.id}`).then(() => window.scrollTo(0, 0))
    }, [api.setPaymentMethod])

    const online = useNetworkStatus()

    if (!online && !data) return <Error type="Offline" />

    const { cart, countries, braintreeToken } = data || {}
    const { email, shippingAddresses } = cart || {}
    const shippingAddress = shippingAddresses && shippingAddresses[0]

    return (
        <React.Fragment>
            <DocumentMetadata title="Checkout" />
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
                    loading: loading && !(shippingAddress && email),
                    submitting: settingContactInfo,
                    error: setContactInfoError,
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
                    loading: loading && !(shippingAddress && shippingAddress.availableShippingMethods),
                    submitting: settingShippingMethod,
                    error: setShippingMethodError,
                    fields: {
                        shippingMethod: {
                            name: 'shippingMethod',
                            items: shippingAddress?.availableShippingMethods?.map(
                                ({ carrierTitle, methodTitle, methodCode, available, amount }: any) => ({
                                    text: `${carrierTitle} (${methodTitle}) ${amount.value.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: amount.currency,
                                    })}`,
                                    value: methodCode,
                                    defaultChecked: methodCode === shippingAddress?.selectedShippingMethod?.methodCode,
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
                    submitting: settingPaymentMethod,
                    error: setPaymentMethodError,
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
                    submitting: placingOrder,
                    error: placeOrderError,
                    submitButton: {
                        text: 'Place Order',
                    },
                    onSubmit: handlePlaceOrder,
                }}
                list={{
                    loading: loading && !cart?.totalQuantity,
                    items: cart?.items.map(({ id, quantity, price, product, options }: any, index: number) => ({
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
                        ...(shippingAddresses
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
