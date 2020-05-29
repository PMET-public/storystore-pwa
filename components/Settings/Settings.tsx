import React, { FunctionComponent, useState, useCallback, useRef, useEffect } from 'react'
import { Root, Wrapper, Buttons, Title, Details, Label, Value } from './Settings.styled'
import { version, dependencies } from '~/package.json'
import { setCookie, COOKIE } from '~/lib/cookies'

import { useRouter } from 'next/router'
import { useApolloClient } from '@apollo/react-hooks'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'

import Form, { Input, FormContext } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { Response } from '~/pages/api/check-endpoint'
import { useCart } from '~/components/Cart/useCart'

const toast = process.browser ? require('react-toastify').toast : {}

const addCredentialsToMagentoUrls = (url: string) => {
    const noCredentialsRegex = /^((?!@).)*$/
    const magentoCloudRegex = /^https?:\/\/.*\-.*\-(.*)\.demo\.magentosite\.cloud/
    const $p = ((noCredentialsRegex.test(url) && url.match(magentoCloudRegex)) || [])[1]

    return $p ? url.replace(/(^https?:\/\/)/, ($1: string) => `${$1}admin:${$p}@`) : url
}

type SettingsProps = {
    defaultMagentoUrl: string
}

export const Settings: FunctionComponent<SettingsProps> = ({ defaultMagentoUrl }) => {
    const { settings, setSettings, setCartId } = useStoryStore()

    const apolloClient = useApolloClient()

    const router = useRouter()

    const formRef = useRef<FormContext>()

    const [saving, setSaving] = useState(false)

    const cart = useCart()

    const handleInputOnFocus = useCallback((event: FocusEvent) => {
        // @ts-ignore
        event.currentTarget?.select()
    }, [])

    const handleSaveOverrides = useCallback(
        async payload => {
            setSaving(true)

            try {
                // Validate
                if (payload.magentoUrl) {
                    payload.magentoUrl = addCredentialsToMagentoUrls(payload.magentoUrl)

                    const res = await fetch(`/api/check-endpoint?url=${payload.magentoUrl}`)

                    const data: Response = await res.json()

                    if (data?.errors) {
                        data.errors.forEach(error => {
                            formRef.current?.setError(error.key, error.level, error.message)
                        })
                        throw Error
                    }
                }

                // Save in StoryStore Context
                setSettings(payload)

                // Reset Store Cart if Changing URL
                if (payload.magentoUrl !== formRef.current?.getValues().magentoUrl) {
                    const cartId = await cart.api.createCart()
                    setCartId(cartId)
                }

                // Reset Apollo Store
                await apolloClient?.resetStore()

                // Refresh
                router.push('/settings')
                toast.success('👍 Saved!')
            } catch (e) {
                console.error(e)
                toast.error('💩 There was an issue. Try again.')
            }

            setSaving(false)
        },
        [router, apolloClient, setCartId, setSettings, setSaving, formRef, cart]
    )

    const handleOnResetToDefaults = useCallback(async () => {
        await handleSaveOverrides({
            magentoUrl: defaultMagentoUrl,
        })

        setCookie(COOKIE.settings, '{}', 365)
    }, [handleSaveOverrides, defaultMagentoUrl])

    return (
        <Root>
            <Title>Storefront Settings</Title>
            <Wrapper>
                <Details>
                    <Label>Version</Label>
                    <Value>
                        PWA {version} (UI {dependencies['@storystore/ui']})
                    </Value>
                </Details>

                <Form
                    options={{
                        mode: 'onSubmit',
                        reValidateMode: 'onSubmit',
                        defaultValues: {
                            ...settings,
                            magentoUrl: settings.magentoUrl ?? defaultMagentoUrl,
                        },
                    }}
                    onSubmit={handleSaveOverrides}
                    ref={formRef}
                >
                    <Input
                        name="magentoUrl"
                        label="Magento URL"
                        style={{ textOverflow: 'ellipsis' }}
                        onFocus={handleInputOnFocus}
                        rules={{
                            pattern: /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
                        }}
                    />

                    <Buttons>
                        <Button type="submit" loading={saving}>
                            Save Changes
                        </Button>
                        <Button disabled={saving} type="button" secondary onClick={handleOnResetToDefaults}>
                            Reset to Defaults
                        </Button>
                    </Buttons>
                </Form>
            </Wrapper>
        </Root>
    )
}
