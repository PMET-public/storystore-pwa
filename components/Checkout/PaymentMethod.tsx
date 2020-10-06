import React, { FunctionComponent, useCallback, useEffect, useRef } from 'react'
import PaymentMethodForm from '@storystore/ui/dist/components/Checkout/PaymentMethodForm'
import { useStoryStore } from '~/lib/storystore'
import { useCart } from '~/hooks/useCart/useCart'

type PaymentMethodProps = {
    onSave: () => any
}

export const PaymentMethod: FunctionComponent<PaymentMethodProps> = ({ onSave }) => {
    const { cartId } = useStoryStore()

    const api = useCart({ cartId })

    const authorizationRef = useRef('')

    const authorization = authorizationRef.current

    useEffect(() => {
        if (api.creatingBraintreeToken.loading) return

        if (!authorization) {
            api.createBraintreeToken().then(({ braintreeToken }) => (authorizationRef.current = braintreeToken))
        }
    }, [api, authorization])

    const handleSetPaymentMethod = useCallback(
        async formData => {
            const { nonce } = formData

            await api.setPaymentMethod({ nonce })

            if (onSave) onSave()
        },
        [api, onSave]
    )

    return (
        <PaymentMethodForm
            title="Payment"
            loading={api.creatingBraintreeToken.loading || !authorization}
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
