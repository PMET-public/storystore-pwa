import React, { FunctionComponent, useState, useCallback, Reducer, useReducer, useRef, useEffect } from 'react'
import { Root, Wrapper, Buttons, Title, Details, Label, Value } from './Settings.styled'
import { toast } from '@pmet-public/luma-ui/lib'
import { version, dependencies } from '~/package.json'

import { useSettings } from './useSettings'
import { useCart } from '~/components/Cart/useCart'

import Form, { Input, FormContext, FieldColors } from '@pmet-public/luma-ui/components/Form'
import Button from '@pmet-public/luma-ui/components/Button'
import { useRouter } from 'next/router'
import { Response } from '~/pages/api/check-endpoint'
import { useApolloClient } from '@apollo/react-hooks'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'

type ReducerState = {
    magentoUrl?: string
    homePageId?: string
    footerBlockId?: string
    googleMapsApiKey?: string
}

type ReducerActions = {
    type: 'save'
    payload: ReducerState
}

export type SettingsProps = {
    defaults: {
        magentoUrl?: string
        homePageId?: string
        footerBlockId?: string
        googleMapsApiKey?: string
    }
}

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
    switch (action.type) {
        case 'save':
            return {
                ...state,
                ...action.payload,
            }

        default:
            throw `Reducer action not valid.`
    }
}

const addCredentialsToMagentoUrls = (url: string) => {
    const noCredentialsRegex = /^((?!@).)*$/
    const magentoCloudRegex = /^https?:\/\/.*\-.*\-(.*)\.demo\.magentosite\.cloud/
    const $p = ((noCredentialsRegex.test(url) && url.match(magentoCloudRegex)) || [])[1]

    return $p ? url.replace(/(^https?:\/\/)/, ($1: string) => `${$1}admin:${$p}@`) : url
}

export const Settings: FunctionComponent<SettingsProps> = ({ defaults }) => {
    const { settings, setSettings, setCartId } = useStoryStore()

    const apolloClient = useApolloClient()

    const router = useRouter()

    const formRef = useRef<FormContext>()

    const [saving, setSaving] = useState(false)

    const [state, dispatch] = useReducer(reducer, settings)

    const {
        queries: { footer, home },
    } = useSettings({
        homePageId: state.homePageId || defaults.homePageId || '',
        footerBlockId: state.footerBlockId || defaults.footerBlockId || '',
    })

    const { api: cartApi } = useCart()

    /**
     * Initial Values
     */
    useEffect(() => {
        formRef.current?.setValue(Object.keys(settings).map(key => ({ [key]: (state as any)[key] })))
    }, [formRef])

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

                    // Reset Store Cart
                    const cartId = await cartApi.createCart()
                    setCartId(cartId)
                }

                // Save Changes
                dispatch({ type: 'save', payload })

                const values: ReducerState = Object.keys(payload).reduce((result, key) => {
                    const value = payload[key]
                    return value ? { ...result, [key]: value } : { ...result }
                }, {})

                // Save in StoryStore Context
                setSettings(values)

                // Reset
                localStorage.clear()
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
        [dispatch, apolloClient, setSaving, formRef, cartApi]
    )

    const handleOnResetToDefaults = useCallback(() => {
        formRef.current?.reset()
        handleSaveOverrides({})
    }, [formRef, handleSaveOverrides])

    return (
        <Root>
            <Title>Storefront Settings</Title>
            <Wrapper>
                <Details>
                    <Label>Version</Label>
                    <Value>
                        {version} (Storybook {dependencies['@pmet-public/luma-ui']})
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
                        placeholder={defaults.magentoUrl}
                        style={{ textOverflow: 'ellipsis' }}
                        rules={{
                            pattern: /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
                        }}
                    />

                    <Input name="googleMapsApiKey" label="Google Maps API Key" placeholder={defaults.googleMapsApiKey} style={{ textOverflow: 'ellipsis' }} />

                    <Input
                        name="homePageId"
                        label="Home Page URL Key"
                        placeholder={defaults.homePageId}
                        style={{ textOverflow: 'ellipsis' }}
                        error={home.loading || home.data?.page ? undefined : `🏡 No Home page found. Did you mean to use "${home.data?.store?.homePage}"?`}
                        color={home.loading || home.data?.page ? FieldColors.default : FieldColors.warning}
                    />

                    <Input
                        name="footerBlockId"
                        label="Footer Block ID"
                        placeholder={defaults.footerBlockId}
                        style={{ textOverflow: 'ellipsis' }}
                        error={footer.loading || footer.data?.footer?.items[0]?.id ? undefined : `🦶 No Footer block found. Using Copyright message instead.`}
                        color={footer.loading || footer.data?.footer?.items[0]?.id ? FieldColors.default : FieldColors.notice}
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
