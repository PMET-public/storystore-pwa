import React, { FunctionComponent, ChangeEvent, useMemo, useState, useCallback } from 'react'
import ContactInfoForm from '@storystore/ui/dist/components/Checkout/ContactInfoForm'
import { useStoryStore } from '~/lib/storystore'
import { useQuery } from '@apollo/client'
import CONTACT_INFO_QUERY from './graphql/ContactInfo.graphql'
import { useCart } from '~/hooks/useCart/useCart'

type ContactInfoProps = {
    edit?: boolean
    onEdit: () => any
    onSave: () => any
}

export const ContactInfo: FunctionComponent<ContactInfoProps> = ({ edit, onEdit, onSave }) => {
    const { cartId } = useStoryStore()

    const api = useCart({ cartId })

    const { loading, data } = useQuery(CONTACT_INFO_QUERY, { variables: { cartId }, skip: !cartId, fetchPolicy: 'network-only', ssr: false })

    const { cart } = data ?? {}

    const shippingAddress = cart?.shippingAddresses[0]

    /**
     * Countries Data
     */
    const [selectedShippingCountryCode, setSelectedShippingCountryCode] = useState<string>(shippingAddress?.country.code || 'US')

    const selectedShippingCountryRegions = useMemo(() => {
        if (!data?.countries) return null
        return data.countries.find((country: { code: string }) => country.code === selectedShippingCountryCode).regions
    }, [data, selectedShippingCountryCode])

    const handleSetContactInformation = useCallback(
        async formData => {
            const { email, city, company, country, firstName, lastName, postalCode, region, street, phone, saveInAddressBook = false } = formData

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

            if (onSave) onSave()
        },
        [api, onSave]
    )

    const handleEditContactInformation = useCallback(() => {
        if (onEdit) onEdit()
    }, [onEdit])

    return (
        <ContactInfoForm
            edit={edit}
            loading={loading}
            submitting={api.settingContactInfo.loading}
            error={api.settingContactInfo.error?.message}
            fields={{
                email: {
                    name: 'email',
                    label: 'Email',
                    defaultValue: cart?.email,
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
                    onChange: (e: ChangeEvent<HTMLSelectElement>) => setSelectedShippingCountryCode(e.currentTarget.value),
                    items: data?.countries
                        ?.filter((x: any) => !!x.name)
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
                        .map((country: { name: string; code: string }) => ({
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
                              items: selectedShippingCountryRegions?.map((region: { name: string; code: string }) => ({
                                  text: region.name,
                                  value: region.code,
                              })),
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
            }}
            editButton={{
                text: 'Edit',
            }}
            submitButton={{
                text: 'Continue to Shipping',
            }}
            onEdit={handleEditContactInformation}
            onSubmit={handleSetContactInformation}
        />
    )
}
