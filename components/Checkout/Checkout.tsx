import React, { FunctionComponent, useCallback, useRef, ChangeEvent } from 'react'
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
        settingPaymentMethod,
        placingOrder,
        api,
    } = useCheckout()

    /**
     * Get Available Regiouns per country selected
     */
    const handleSelectedCountry = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            const { options } = event.currentTarget
            const { value } = options[options.selectedIndex]
            api.getAvailableRegions({ countryCode: value })
        },
        [api.getAvailableRegions]
    )

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
                countryCode,
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
            const { useShippingAddress } = formData

            const { shippingAddresses = [] } = data.cart
            const [shippingAddress] = shippingAddresses

            const address = useShippingAddress
                ? // Use Shipping Address Data Saved in the Cart
                  {
                      city: shippingAddress.city,
                      company: shippingAddress.company,
                      countryCode: shippingAddress.country.code,
                      firstName: shippingAddress.firstName,
                      lastName: shippingAddress.lastName,
                      phoneNumber: shippingAddress.phoneNumber,
                      region: shippingAddress.region.code,
                      saveInAddressBook: false,
                      street: shippingAddress.street,
                      zipCode: shippingAddress.zipCode,
                  }
                : // Data from From
                  {
                      city: formData.city,
                      company: formData.company,
                      countryCode: formData.country,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      phoneNumber: formData.phoneNumber,
                      region: formData.region,
                      saveInAddressBook: false,
                      street: [formData.street1, formData.street2],
                      zipCode: formData.zipCode,
                  }

            api.setBillingAddress({ address })
        },
        [api.setShippingAddress, data.cart && JSON.stringify(data.cart.shippingAddresses)]
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

    const handleSetPaymentMethod = useCallback(async () => {
        if (!braintreeInstance.current) return
        const { nonce } = await braintreeInstance.current.requestPaymentMethod()
        api.setPaymentMethod({ nonce })
    }, [api.setPaymentMethod])

    /**
     * Place Order
     */
    const handlePlaceOrder = useCallback(async () => {
        api.placeOrder()
    }, [api.placeOrder])

    if (loading) return <span>loading</span>

    if (error) return <span>{error.message}</span>

    const { cart, countries, availableRegions } = data
    const { email, shippingAddresses, braintreeToken } = cart
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
                        label: 'Company',
                        name: 'company',
                        defaultValue: shippingAddress.company,
                        rules: {
                            required: false,
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
                        label: 'Address 2',
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
                        field: 'select',
                        label: 'Country',
                        name: 'countryCode',
                        onChange: handleSelectedCountry, // TODO: it broke
                        defaultValue: shippingAddress.country.code,
                        rules: {
                            required: true,
                        },
                        items: countries.map((country: any) => ({
                            text: country.name,
                            value: country.code,
                        })),
                    },
                    availableRegions && availableRegions.country.regions
                        ? {
                              field: 'select',
                              label: 'State',
                              name: 'region',
                              defaultValue: shippingAddress.region.code, // TODO: Fix default value not setting on load
                              rules: {
                                  required: true,
                              },
                              items: availableRegions.country.regions.map((region: any) => ({
                                  text: region.name,
                                  code: region.code,
                              })),
                          }
                        : {
                              field: 'text',
                              label: 'State',
                              name: 'region',
                              defaultValue: shippingAddress.region.code,
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
                        name: 'useShippingAddress',
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
                        // defaultValue: billingAddress.firstName,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Last Name',
                        name: 'lastName',
                        // defaultValue: billingAddress.lastName,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Company',
                        name: 'company',
                        // defaultValue: billingAddress.company,
                        // rules: {
                        //     required: false,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Address',
                        name: 'street1',
                        // defaultValue: billingAddress.street && billingAddress.street[0],
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Address 2',
                        name: 'street2',
                        // defaultValue: billingAddress.street && billingAddress.street[1],
                        rules: {},
                    },
                    {
                        field: 'text',
                        label: 'City',
                        name: 'city',
                        // defaultValue: billingAddress.city,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'State',
                        name: 'region',
                        // defaultValue: billingAddress.region.label,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Zip Code',
                        name: 'zipCode',
                        // defaultValue: billingAddress.zipCode,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Country',
                        name: 'country',
                        // defaultValue: billingAddress.country.code,
                        // rules: {
                        //     required: true,
                        // },
                    },
                    {
                        field: 'text',
                        label: 'Phone Number',
                        name: 'phoneNumber',
                        // defaultValue: billingAddress.phoneNumber,
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
                            vaultManager: true,
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
            <button disabled={settingPaymentMethod} onClick={handleSetPaymentMethod}>
                {settingPaymentMethod ? 'Loading' : 'Save'}
            </button>

            <hr />
            <button disabled={placingOrder} onClick={handlePlaceOrder}>
                {placingOrder ? 'Loading' : 'Place Order'}
            </button>
        </React.Fragment>
    )
}
