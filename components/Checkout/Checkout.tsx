import React, { FunctionComponent, useCallback, useState, useEffect, useMemo } from 'react'
import { useCheckout } from './useCheckout'
import CheckoutTemplate from '@pmet-public/luma-ui/dist/templates/Checkout'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'
import Error from '../Error'
import DocumentMetadata from '../DocumentMetadata'
import { useRouter } from 'next/router'
import Link from '../Link'
import { resolveImage } from '../../lib/resolveImage'

type CheckoutProps = {}

export const Checkout: FunctionComponent<CheckoutProps> = ({}) => {
    const { loading, error, data, api, online, refetch } = useCheckout()

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
        (data && data.cart && data.cart.shippingAddress && data.cart.shippingAddress.country.code) || 'US'
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

    if (!data || !data.cart) return null

    if (error && !online) return <Error type="Offline" />

    if (error) <Error type="500" button={{ text: 'Try again', onClick: refetch }} />

    if (loading) return <ViewLoader />

    const { cart, countries } = data
    const { email, shippingAddresses, braintreeToken } = cart
    const shippingAddress = shippingAddresses[0]

    return (
        <React.Fragment>
            <DocumentMetadata title="Checkout" />
            <CheckoutTemplate
                breadcrumbs={{
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
                    fields: {
                        email: {
                            label: 'Email',
                            defaultValue: email,
                        },
                        firstName: {
                            label: 'First Name',
                            defaultValue: shippingAddress.firstName,
                        },
                        lastName: {
                            label: 'Last Name',
                            defaultValue: shippingAddress.lastName,
                        },
                        company: {
                            label: 'Company (optional)',
                            defaultValue: shippingAddress.company,
                        },
                        address1: {
                            label: 'Address',
                            defaultValue: shippingAddress.street[0],
                        },
                        address2: {
                            label: 'Apt, Suite, Unit, etc (optional)',
                            defaultValue: shippingAddress.street[1],
                        },
                        city: {
                            label: 'City',
                            defaultValue: shippingAddress.city,
                        },
                        country: {
                            label: 'Country',

                            defaultValue: selectedShippingCountryCode,
                            disabled: true, // US only for now
                            onChange: e => setSelectedShippingCountryCode(e.currentTarget.value),
                            items: countries.map((country: { name: string; code: string }) => ({
                                text: country.name,
                                value: country.code,
                            })),
                        },
                        region: {
                            label: 'State',
                            defaultValue: shippingAddress.region.code,
                            type: 'text',
                            ...(selectedShippingCountryRegions
                                ? {
                                      type: 'select',
                                      items: selectedShippingCountryRegions.map(
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
                            label: 'Postal Code',
                            defaultValue: shippingAddress.postalCode,
                        },
                        phone: {
                            label: 'Phone Number',
                            defaultValue: shippingAddress.phone,
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
                    items: shippingAddress.availableShippingMethods.map(
                        ({ methodTitle, methodCode, available, amount }: any) => ({
                            text: `${methodTitle} ${amount.value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: amount.currency,
                            })}`,
                            value: methodCode,
                            defaultChecked: methodCode === shippingAddress.selectedShippingMethod.methodCode,
                            disabled: !available,
                        })
                    ),
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
                    submitButton: {
                        text: 'Place Order',
                    },
                    onSubmit: handlePlaceOrder,
                }}
                list={{
                    items:
                        cart.items &&
                        cart.items.map(({ id, quantity, product, options }: any, index: number) => ({
                            _id: id || index,
                            title: {
                                text: product.name,
                            },
                            sku: `SKU. ${product.sku}`,
                            thumbnail: {
                                alt: product.thumbnail.label,
                                src: resolveImage(product.thumbnail.url, { width: 250 }),
                            },
                            quantity: {
                                value: quantity,
                                addLabel: `Add another ${product.name} from shopping bag`,
                                substractLabel: `Remove one ${product.name} from shopping bag`,
                                removeLabel: `Remove all ${product.name} from shopping bag`,
                            },
                            price: {
                                currency: product.price.regular.amount.currency,
                                regular: product.price.regular.amount.value,
                            },
                            options:
                                options &&
                                options.map(({ id, label, value }: any) => ({
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
                    prices: cart.prices && [
                        {
                            label: 'Subtotal',
                            price: cart.prices.subTotal && {
                                currency: cart.prices.subTotal.currency,
                                regular: cart.prices.subTotal.value,
                            },
                        },
                        {
                            label: 'Shipping',
                            price: shippingAddress.selectedShippingMethod.amount && {
                                currency: shippingAddress.selectedShippingMethod.amount.currency,
                                regular: shippingAddress.selectedShippingMethod.amount.value,
                            },
                        },
                        {
                            label: 'Taxes',
                            price: cart.prices.taxes[0] && {
                                currency: cart.prices.taxes[0] && cart.prices.taxes[0].currency,
                                regular: cart.prices.taxes.reduce(
                                    (accum: number, tax: { value: number }) => accum + tax.value,
                                    0
                                ),
                            },
                        },
                        {
                            appearance: 'bold',
                            label: 'Total',
                            price: cart.prices.total && {
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
