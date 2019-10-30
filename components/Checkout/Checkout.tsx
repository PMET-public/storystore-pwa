import React, { FunctionComponent, useCallback, useRef } from 'react'
import FormBuilder, { patterns } from 'luma-ui/dist/components/FormBuilder'
import Braintree, { BraintreeDropin } from 'luma-ui/dist/components/Braintree'
import { useCheckout } from './useCheckout'

type CheckoutProps = {}

export const Checkout: FunctionComponent<CheckoutProps> = ({}) => {
    const {
        loading,
        error,
        data,
        settingGuestEmailAddress,
        settingShippingAddress,
        settingShippingMethod,
        settingBillingAddress,
        settingPaymentMethodAndOrder,
        api,
    } = useCheckout()

    /**
     * Contact Information
     */
    const handleSetContactInformation = useCallback(
        formData => {
            const { emailAddress } = formData
            api.setGuestEmailAddress({ emailAddress })
        },
        [api.setGuestEmailAddress]
    )

    /**
     * Shipping Address
     */

    const handleSetShippingAddress = useCallback(
        formData => {
            const {
                city,
                company,
                countryCode = 'US',
                firstName,
                lastName,
                zipCode,
                region,
                saveInAddressBook = false,
                street1,
                street2,
                phoneNumber,
            } = formData

            api.setShippingAddress({
                address: {
                    city,
                    company,
                    countryCode,
                    firstName,
                    lastName,
                    zipCode,
                    region,
                    saveInAddressBook,
                    street: [street1, street2],
                    phoneNumber,
                },
            })
        },
        [api.setShippingAddress]
    )

    /**
     * Billing Address
     */
    const handleSetBillingAddress = useCallback(
        formData => {
            const {
                city,
                company,
                countryCode = 'US',
                firstName,
                lastName,
                zipCode,
                region,
                saveInAddressBook = false,
                street1,
                street2,
                phoneNumber,
            } = formData

            api.setBillingAddress({
                address: {
                    city,
                    company,
                    countryCode,
                    firstName,
                    lastName,
                    zipCode,
                    region,
                    saveInAddressBook,
                    street: [street1, street2],
                    phoneNumber,
                },
            })
        },
        [api.setShippingAddress]
    )

    /**
     * Shipping Method
     */
    const handleSetShippingMethod = useCallback(
        formData => {
            const { shippingMethod: methodCode } = formData
            api.setShippingMethod({ methodCode })
        },
        [api.setShippingMethod]
    )

    /**
     * Payment Method
     */
    const braintreeInstance = useRef<BraintreeDropin>()

    const handleSetPaymentMethodAndOrder = useCallback(async () => {
        if (!braintreeInstance.current) return
        const { nonce } = await braintreeInstance.current.requestPaymentMethod()
        api.setPaymentMethodAndOrder({ nonce })
    }, [api.setPaymentMethodAndOrder])

    if (loading) return <span>loading</span>

    if (error) return <span>{error.message}</span>

    const { cart, order } = data
    const { email, shippingAddresses, billingAddress, braintreeToken } = cart
    const [shippingAddress] = shippingAddresses

    return (
        <React.Fragment>
            <FormBuilder
                title={{
                    text: 'Contact Information',
                }}
                fields={[
                    {
                        field: 'text',
                        label: 'Email Address',
                        name: 'emailAddress',
                        defaultValue: email,
                        rules: {
                            required: true,
                            pattern: patterns.email,
                        },
                    },
                ]}
                onSubmit={handleSetContactInformation}
                submitButton={{
                    text: 'Save',
                    loader: settingGuestEmailAddress ? { label: 'Updating' } : undefined,
                }}
            />

            <FormBuilder
                title={{
                    text: 'Shipping Address',
                }}
                fields={[
                    {
                        field: 'text',
                        label: 'First Name',
                        name: 'firstName',
                        defaultValue: shippingAddress.firstName,
                        rules: {
                            required: true,
                        },
                    },
                    {
                        field: 'text',
                        label: 'Last Name',
                        name: 'lastName',
                        defaultValue: shippingAddress.lastName,
                        rules: {
                            required: true,
                        },
                    },
                    {
                        field: 'text',
                        label: 'Address',
                        name: 'street1',
                        defaultValue: shippingAddress.street && shippingAddress.street[0],
                        rules: {
                            required: true,
                        },
                    },
                    {
                        field: 'text',
                        label: 'Address',
                        name: 'street2',
                        defaultValue: shippingAddress.street && shippingAddress.street[1],
                        rules: {},
                    },
                    {
                        field: 'text',
                        label: 'City',
                        name: 'city',
                        defaultValue: shippingAddress.city,
                        rules: {
                            required: true,
                        },
                    },
                    {
                        field: 'text',
                        label: 'State',
                        name: 'region',
                        defaultValue: shippingAddress.region.label,
                        rules: {
                            required: true,
                        },
                    },
                    {
                        field: 'text',
                        label: 'Zip Code',
                        name: 'zipCode',
                        defaultValue: shippingAddress.zipCode,
                        rules: {
                            required: true,
                        },
                    },
                    {
                        field: 'text',
                        label: 'Phone Number',
                        name: 'phoneNumber',
                        defaultValue: shippingAddress.phoneNumber,
                        rules: {
                            required: true,
                        },
                    },
                ]}
                onSubmit={handleSetShippingAddress}
                submitButton={{
                    text: 'Save',
                    loader: settingShippingAddress ? { label: 'Updating' } : undefined,
                }}
            />

            <FormBuilder
                title={{
                    text: 'Shipping Method',
                }}
                fields={[
                    {
                        field: 'selection',
                        name: 'shippingMethod',
                        rules: {
                            required: true,
                        },

                        items: shippingAddress.availableShippingMethods.map(
                            ({ methodTitle, methodCode, available, amount }: any) => ({
                                text: `${methodTitle} ${amount.value.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: amount.currency,
                                })}`,
                                defaultValue: methodCode,
                                defaultChecked: methodCode === shippingAddress.selectedShippingMethod.methodCode,
                                disabled: !available,
                            })
                        ),
                    },
                ]}
                onSubmit={handleSetShippingMethod}
                submitButton={{
                    text: 'Save',
                    loader: settingShippingMethod ? { label: 'Updating' } : undefined,
                }}
            />

            <FormBuilder
                title={{
                    text: 'Billing Address',
                }}
                fields={[
                    {
                        field: 'selection',
                        name: 'sameAsShipping',
                        type: 'checkbox',

                        items: [
                            {
                                text: 'Same as shipping',
                            },
                        ],
                    },
                    {
                        field: 'text',
                        label: 'First Name',
                        name: 'firstName',
                        defaultValue: billingAddress.firstName,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Last Name',
                        name: 'lastName',
                        defaultValue: billingAddress.lastName,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Address',
                        name: 'street1',
                        defaultValue: billingAddress.street && billingAddress.street[0],
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Address',
                        name: 'street2',
                        defaultValue: billingAddress.street && billingAddress.street[1],
                        rules: {},
                    },
                    {
                        field: 'text',
                        label: 'City',
                        name: 'city',
                        defaultValue: billingAddress.city,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'State',
                        name: 'region',
                        defaultValue: billingAddress.region.label,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Zip Code',
                        name: 'zipCode',
                        defaultValue: billingAddress.zipCode,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Phone Number',
                        name: 'phoneNumber',
                        defaultValue: billingAddress.phoneNumber,
                        // rules: {
                        //     required: true,
                        // },
                    },
                ]}
                onSubmit={handleSetBillingAddress}
                submitButton={{
                    text: 'Save',
                    loader: settingBillingAddress ? { label: 'Updating' } : undefined,
                }}
            />

            {braintreeToken && (
                <React.Fragment>
                    <Braintree
                        options={{
                            authorization: braintreeToken,
                            // vaultManager: true,
                            preselectVaultedPaymentMethod: true,

                            card: {
                                overrides: {
                                    fields: {
                                        number: {
                                            maskInput: {
                                                // Only show last four digits on blur.
                                                showLastFour: true,
                                            },
                                        },
                                    },
                                },
                            },
                        }}
                        onLoad={x => (braintreeInstance.current = x)}
                    />
                </React.Fragment>
            )}
            <hr />
            <button disabled={settingPaymentMethodAndOrder || order} onClick={handleSetPaymentMethodAndOrder}>
                {settingPaymentMethodAndOrder ? 'Placing Order' : 'Place Order'}
            </button>

            {order && (
                <div>
                    <h1>Order: {order.id}</h1>
                </div>
            )}
        </React.Fragment>
    )
}
