import React, { FunctionComponent, useState, useCallback, Reducer, useReducer, useRef, useEffect } from 'react'
import { Root, Wrapper, Buttons, Title, Details, Label, Value } from './Settings.styled'
import { setCookie, getCookie } from '../../lib/cookies'
import { SETTINGS_OVERRIDE_COOKIE } from '../../lib/overrideFromCookie'
import { toast } from '@pmet-public/luma-ui/dist/lib'
import { version } from '../../package.json'
import { version as lumaUIVersion } from '@pmet-public/luma-ui/package.json'

import { useSettings } from './useSettings'

import Form, { Input, FormContext, FieldColors } from '@pmet-public/luma-ui/dist/components/Form'
import Button from '@pmet-public/luma-ui/dist/components/Button'
import ApolloClient from 'apollo-client'
import { useRouter } from 'next/router'

export type SettingsProps = {
    defaults: {
        MAGENTO_URL?: string
        HOME_PAGE_ID?: string
        FOOTER_BLOCK_ID?: string
        GOOGLE_MAPS_API_KEY?: string
    }
    apolloClient?: ApolloClient<any>
}

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

const initialState: ReducerState = process.browser ? JSON.parse(getCookie(SETTINGS_OVERRIDE_COOKIE) ?? '{}') : {}

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

export const Settings: FunctionComponent<SettingsProps> = ({ defaults, apolloClient }) => {
    const router = useRouter()

    const formRef = useRef<FormContext>()

    const [saving, setSaving] = useState(false)

    const [state, dispatch] = useReducer(reducer, initialState)

    const { footer, home } = useSettings({
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
                dispatch({ type: 'save', payload })

                const values: ReducerState = Object.keys(payload).reduce((result, key) => {
                    const value = payload[key]
                    return value ? { ...result, [key]: value } : { ...result }
                }, {})

                setCookie(SETTINGS_OVERRIDE_COOKIE, JSON.stringify(values), 365)

                localStorage.clear()

                await apolloClient?.resetStore()

                router.push('/settings')
            } catch (e) {
                console.error(e)
                toast.error('💩 Oops! There was an issue. Try again.')
            }

            setSaving(false)

            toast.success('👍 Saved!')
        },
        [dispatch, apolloClient, setSaving]
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
                        {version} (Storybook {lumaUIVersion})
                    </Value>
                </Details>

                <Form onSubmit={handleSaveOverrides} ref={formRef}>
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
                                : `🏡 No Home page found. Did you mean to use "${home.data?.storeConfig.homePage}"?`
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
