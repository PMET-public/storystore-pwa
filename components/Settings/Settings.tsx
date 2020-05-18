import React, { FunctionComponent, useState, useCallback, useRef, useEffect } from 'react'
import { Root, Wrapper, Buttons, Title, Details, Label, Value } from './Settings.styled'
import { version, dependencies } from '~/package.json'
import { setCookie, COOKIE } from '~/lib/cookies'
import gql from 'graphql-tag'

import { useRouter } from 'next/router'
import { useApolloClient, useQuery } from '@apollo/react-hooks'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'

import Form, { Input, FormContext, FieldColors } from '@storystore/ui/dist/components/Form'
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

export const Settings: FunctionComponent = () => {
    const { settings, setSettings, setCartId } = useStoryStore()

    const apolloClient = useApolloClient()

    const router = useRouter()

    const formRef = useRef<FormContext>()

    const [saving, setSaving] = useState(false)

    const cart = useCart()

    const homePageQuery = useQuery(
        gql`
            query SettingsHomeCheck($id: String!) {
                store: storeConfig {
                    id
                    homePage: cms_home_page
                }

                page: cmsPage(identifier: $id) {
                    id: url_key
                }
            }
        `,
        { variables: { id: settings.homePageId }, errorPolicy: 'all' }
    )

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
            magentoUrl: process.env.MAGENTO_URL,
            homePageId: process.env.HOME_PAGE_ID,
        })

        setCookie(COOKIE.settings, '{}', 365)
    }, [handleSaveOverrides])

    useEffect(() => {
        // Override values
        Object.entries(settings).forEach(([key, value = '']) => {
            formRef.current?.setValue(key, value)
        })
    }, [formRef, settings])

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
                    }}
                    onSubmit={handleSaveOverrides}
                    ref={formRef}
                >
                    <Input
                        name="magentoUrl"
                        label="Magento URL"
                        defaultValue={settings.magentoUrl}
                        style={{ textOverflow: 'ellipsis' }}
                        onFocus={handleInputOnFocus}
                        rules={{
                            pattern: /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
                        }}
                    />

                    <Input
                        name="homePageId"
                        label="Home Page URL Key"
                        defaultValue={settings.homePageId}
                        style={{ textOverflow: 'ellipsis' }}
                        onFocus={handleInputOnFocus}
                        error={homePageQuery.loading || homePageQuery.data?.page ? undefined : `🏡 No Home page found. Did you mean to use "${homePageQuery.data?.store?.homePage}"?`}
                        color={homePageQuery.loading || homePageQuery.data?.page ? FieldColors.default : FieldColors.warning}
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
