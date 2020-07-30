import React, { FunctionComponent, useCallback } from 'react'
import ShippingMethodForm from '@storystore/ui/dist/components/Checkout/ShippingMethodForm'
import { useStoryStore } from '~/lib/storystore'
import { useQuery } from '@apollo/client'
import SHIPPING_METHOD_QUERY from './graphql/ShippingMethod.graphql'
import { useCart } from '~/hooks/useCart/useCart'

type ShippingMethodProps = {
    edit?: boolean
    onEdit: () => any
    onSave: () => any
}

export const ShippingMethod: FunctionComponent<ShippingMethodProps> = ({ edit, onEdit, onSave }) => {
    const { cartId } = useStoryStore()

    const api = useCart({ cartId })

    const { loading, data } = useQuery(SHIPPING_METHOD_QUERY, { variables: { cartId }, skip: !cartId, fetchPolicy: 'network-only', ssr: false })

    const { cart } = data ?? {}

    const { availableShippingMethods, selectedShippingMethod } = (cart?.shippingAddresses && cart.shippingAddresses[0]) || {}

    const handleSetShippingMethod = useCallback(
        async formData => {
            const { methodCode, carrierCode } = JSON.parse(formData.shippingMethod)

            await api.setShippingMethod({ methodCode, carrierCode })

            if (onSave) onSave()
        },
        [api, onSave]
    )

    const handleEditShippingMethod = useCallback(() => {
        if (onEdit) onEdit()
    }, [onEdit])

    return (
        <ShippingMethodForm
            edit={edit}
            loading={loading}
            submitting={api.settingShippingMethod.loading}
            error={api.settingShippingMethod.error?.message}
            fields={{
                shippingMethod: {
                    name: 'shippingMethod',
                    items: availableShippingMethods?.map(({ carrierTitle, methodTitle, methodCode, carrierCode, available, amount }: any) => ({
                        text: `${carrierTitle} (${methodTitle}) ${amount.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: amount.currency,
                        })}`,
                        value: JSON.stringify({ methodCode, carrierCode }),
                        defaultChecked: methodCode === selectedShippingMethod?.methodCode,
                        disabled: !available,
                    })),
                },
            }}
            editButton={{
                text: 'Edit',
            }}
            submitButton={{
                text: 'Continue to Payment',
            }}
            onEdit={handleEditShippingMethod}
            onSubmit={handleSetShippingMethod}
        />
    )
}
