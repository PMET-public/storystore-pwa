import React, { FunctionComponent, useState, useCallback, Reducer, useReducer, useRef, useEffect } from 'react'
import { Root, Wrapper, Buttons, Title, Details, Label, Value } from './Settings.styled'
import { setCookie, getCookie } from '../../lib/cookies'
import { SETTINGS_OVERRIDE_COOKIE } from '../../lib/overrideFromCookie'
import { toast } from '@pmet-public/luma-ui/dist/lib'
import { version, dependencies } from '../../package.json'

import { useSettings } from './useSettings'

import Form, { Input, FormContext, FieldColors } from '@pmet-public/luma-ui/dist/components/Form'
import Button from '@pmet-public/luma-ui/dist/components/Button'
import { useRouter } from 'next/router'
import { Response } from '../../pages/api/check-endpoint'
import { useApolloClient } from '@apollo/react-hooks'

type ReducerState = {
    MAGENTO_URL?: string
    HOME_PAGE_ID?: string
    FOOTER_BLOCK_ID?: string
    GOOGLE_MAPS_API_KEY?: string
}

type ReducerActions = {
    type: 'save'
    payload: ReducerState
}

export type SettingsProps = {
    defaults: {
        MAGENTO_URL?: string
        HOME_PAGE_ID?: string
        FOOTER_BLOCK_ID?: string
        GOOGLE_MAPS_API_KEY?: string
    }
    state: ReducerState
}

const initialState: ReducerState = process.browser ? JSON.parse(getCookie(SETTINGS_OVERRIDE_COOKIE) ?? '{}') : null

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

export const Settings: FunctionComponent<SettingsProps> = ({ defaults, state: _state }) => {
    const apolloClient = useApolloClient()

    const router = useRouter()

    const formRef = useRef<FormContext>()

    const [saving, setSaving] = useState(false)

    const [state, dispatch] = useReducer(reducer, initialState || _state)

    const {
        queries: { footer, home },
    } = useSettings({
        homePageId: state.HOME_PAGE_ID || defaults.HOME_PAGE_ID || '',
        footerBlockId: state.FOOTER_BLOCK_ID || defaults.FOOTER_BLOCK_ID || '',
    })

    /**
     * Initial Values
     */
    useEffect(() => {
        formRef.current?.setValue(Object.keys(initialState).map(key => ({ [key]: (state as any)[key] })))
    }, [formRef])

    const handleSaveOverrides = useCallback(
        async payload => {
            setSaving(true)

            try {
                // Validate
                if (payload.MAGENTO_URL) {
                    payload.MAGENTO_URL = addCredentialsToMagentoUrls(payload.MAGENTO_URL)

                    const res = await fetch(`/api/check-endpoint?url=${payload.MAGENTO_URL}`)

                    const data: Response = await res.json()

                    if (data?.errors) {
                        data.errors.forEach(error => {
                            formRef.current?.setError(error.key, error.level, error.message)
                        })
                        throw Error
                    }
                }

                // Save Changes
                dispatch({ type: 'save', payload })

                const values: ReducerState = Object.keys(payload).reduce((result, key) => {
                    const value = payload[key]
                    return value ? { ...result, [key]: value } : { ...result }
                }, {})

                setCookie(SETTINGS_OVERRIDE_COOKIE, JSON.stringify(values), 365)

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
        [dispatch, apolloClient, setSaving, formRef]
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
                        name="MAGENTO_URL"
                        label="Magento URL"
                        placeholder={defaults.MAGENTO_URL}
                        style={{ textOverflow: 'ellipsis' }}
                        rules={{
                            pattern: /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
                        }}
                    />

                    <Input
                        name="GOOGLE_MAPS_API_KEY"
                        label="Google Maps API Key"
                        placeholder={defaults.GOOGLE_MAPS_API_KEY}
                        style={{ textOverflow: 'ellipsis' }}
                    />

                    <Input
                        name="HOME_PAGE_ID"
                        label="Home Page URL Key"
                        placeholder={defaults.HOME_PAGE_ID}
                        style={{ textOverflow: 'ellipsis' }}
                        error={
                            home.loading || home.data?.page
                                ? undefined
                                : `🏡 No Home page found. Did you mean to use "${home.data?.storeConfig?.homePage}"?`
                        }
                        color={home.loading || home.data?.page ? FieldColors.default : FieldColors.warning}
                    />

                    <Input
                        name="FOOTER_BLOCK_ID"
                        label="Footer Block ID"
                        placeholder={defaults.FOOTER_BLOCK_ID}
                        style={{ textOverflow: 'ellipsis' }}
                        error={
                            footer.loading || footer.data?.footer?.items[0]?.id
                                ? undefined
                                : `🦶 No Footer block found. Using Copyright message instead.`
                        }
                        color={
                            footer.loading || footer.data?.footer?.items[0]?.id
                                ? FieldColors.default
                                : FieldColors.notice
                        }
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
