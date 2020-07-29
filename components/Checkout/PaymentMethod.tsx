import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import PaymentMethodForm from '@storystore/ui/dist/components/Checkout/PaymentMethodForm'
import { useStoryStore } from '~/lib/storystore'
import { useCart } from '~/hooks/useCart/useCart'

type PaymentMethodProps = {
    onSave: () => any
}

export const PaymentMethod: FunctionComponent<PaymentMethodProps> = ({ onSave }) => {
    const { cartId } = useStoryStore()

    const api = useCart({ cartId })

    const [authorization, setAuthorization] = useState('')

    useEffect(() => {
        if (!authorization) {
            api.createBraintreeToken().then(({ braintreeToken }) => setAuthorization(braintreeToken))
        }
    }, [api, authorization])

    console.log('PaymentMethod.tsx', authorization)

    const handleSetPaymentMethod = useCallback(
        async formData => {
            const { nonce } = formData
            debugger
            await api.setPaymentMethod({ nonce })
            debugger
            if (onSave) onSave()
        },
        [api, onSave]
    )

    return (
        <PaymentMethodForm
            key={authorization}
            title="Payment"
            loading={api.creatingBraintreeToken.loading}
            submitting={api.settingPaymentMethod.loading}
            error={api.settingPaymentMethod.error?.message}
            braintree={{
                authorization,
                vaultManager: true,
                preselectVaultedPaymentMethod: true,
            }}
            editButton={{
                text: 'Edit',
            }}
            submitButton={{
                text: 'Continue and Finish',
            }}
            onSubmit={handleSetPaymentMethod}
        />
    )
}
