import React, { FunctionComponent, useCallback, Reducer, useReducer } from 'react'
import { Root, Buttons, Title, Overrides, Details, Label, Value } from './Settings.styled'
import { setCookie, getCookie, deleteCookie } from '../../lib/cookies'
import { version } from '../../package.json'
import { version as lumaUIVersion } from '@pmet-public/luma-ui/package.json'

import { useSettings } from './useSettings'
import { useAppContext } from '@pmet-public/luma-ui/dist/AppProvider'

import Form, { Input } from '@pmet-public/luma-ui/dist/components/Form'
import Loader from '@pmet-public/luma-ui/dist/components/Loader'
import Button from '@pmet-public/luma-ui/dist/components/Button'

export type SettingsProps = {
    defaults: {
        MAGENTO_URL?: string
        HOME_PAGE_ID?: string
        CATEGORIES_PARENT_ID?: string
        FOOTER_BLOCK_ID?: string
        GOOGLE_MAPS_API_KEY?: string
    }
}

type ReducerState = {
    MAGENTO_URL?: string
    HOME_PAGE_ID?: string
    CATEGORIES_PARENT_ID?: string
    FOOTER_BLOCK_ID?: string
    GOOGLE_MAPS_API_KEY?: string
}

type ReducerActions = {
    type: 'save'
    payload: ReducerState
}

const initialState: ReducerState = {
    MAGENTO_URL: (process.browser && getCookie('MAGENTO_URL')) || undefined,
    HOME_PAGE_ID: (process.browser && getCookie('HOME_PAGE_ID')) || undefined,
    CATEGORIES_PARENT_ID: (process.browser && getCookie('CATEGORIES_PARENT_ID')) || undefined,
    FOOTER_BLOCK_ID: (process.browser && getCookie('FOOTER_BLOCK_ID')) || undefined,
    GOOGLE_MAPS_API_KEY: (process.browser && getCookie('GOOGLE_MAPS_API_KEY')) || undefined,
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

export const Settings: FunctionComponent<SettingsProps> = ({ defaults }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const { toast } = useAppContext()

    const { data, loading, refetch } = useSettings()

    const handleSaveOverrides = useCallback(
        payload => {
            try {
                dispatch({ type: 'save', payload })

                Object.keys(payload).forEach(key => {
                    const value = payload[key]
                    if (value) {
                        setCookie(key, value, 365)
                    } else {
                        deleteCookie(key)
                    }
                })

                localStorage.clear()

                refetch() // fetch new data

                toast.success('Saved!')
            } catch (e) {
                toast.error('Oops! There was an issue. Trye again.')
            }
        },
        [dispatch]
    )

    return (
        <React.Fragment>
            <Root>
                <Details>
                    {loading || !data?.storeConfig ? (
                        <Loader arial-label="loading server details" />
                    ) : (
                        <React.Fragment>
                            <Label>Version</Label>
                            <Value>
                                {version} / Storybook {lumaUIVersion}
                            </Value>

                            <Label>Store ID</Label>
                            <Value>{data.storeConfig.id}</Value>

                            <Label>Base URL</Label>
                            <Value>{data.storeConfig.baseUrl}</Value>

                            <Label>Locale</Label>
                            <Value>{data.storeConfig.locale}</Value>
                        </React.Fragment>
                    )}
                </Details>

                <Overrides>
                    <Title>Overrides</Title>
                    <Form onSubmit={handleSaveOverrides}>
                        <Input
                            name="MAGENTO_URL"
                            label="Magento URL"
                            defaultValue={state.MAGENTO_URL}
                            placeholder={defaults.MAGENTO_URL}
                            style={{ textOverflow: 'ellipsis' }}
                        />

                        <Input
                            name="HOME_PAGE_ID"
                            label="Home Page ID"
                            defaultValue={state.HOME_PAGE_ID}
                            placeholder={defaults.HOME_PAGE_ID}
                            style={{ textOverflow: 'ellipsis' }}
                        />

                        <Input
                            name="CATEGORIES_PARENT_ID"
                            label="Categories Parent ID"
                            defaultValue={state.CATEGORIES_PARENT_ID}
                            placeholder={defaults.CATEGORIES_PARENT_ID}
                            style={{ textOverflow: 'ellipsis' }}
                        />

                        <Input
                            name="FOOTER_BLOCK_ID"
                            label="Footer Block ID"
                            defaultValue={state.FOOTER_BLOCK_ID}
                            placeholder={defaults.FOOTER_BLOCK_ID}
                            style={{ textOverflow: 'ellipsis' }}
                        />

                        <Input
                            name="GOOGLE_MAPS_API_KEY"
                            label="Google Maps API Key"
                            defaultValue={state.GOOGLE_MAPS_API_KEY}
                            placeholder={defaults.GOOGLE_MAPS_API_KEY}
                            style={{ textOverflow: 'ellipsis' }}
                        />

                        <Buttons>
                            <Button type="submit">Save Changes</Button>
                        </Buttons>
                    </Form>
                </Overrides>
            </Root>
        </React.Fragment>
    )
}
