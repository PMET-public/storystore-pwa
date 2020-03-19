import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { Root, Buttons, Title, Overrides, Details, Label, Value } from './Settings.styled'
import { setCookie, getCookie, deleteCookie } from '../../lib/cookies'
import { version } from '../../package.json'

import { useSettings } from './useSettings'

import Form, { Input } from '@pmet-public/luma-ui/dist/components/Form'
import Loader from '@pmet-public/luma-ui/dist/components/Loader'
import Button from '@pmet-public/luma-ui/dist/components/Button'

export type SettingsProps = {
    defaults: {
        magentoUrl: string
    }
}

export const Settings: FunctionComponent<SettingsProps> = ({ defaults }) => {
    const [overrideMagentoUrl, setOverrideMagentoUrl] = useState(getCookie('MAGENTO_URL') ?? undefined)

    const { data, loading, fetchDetails } = useSettings()

    // const handleResetOverrides = useCallback(() => {
    //     setOverrideMagentoUrl(null)
    // }, [])

    const handleClearCache = useCallback(() => {
        localStorage.clear()
    }, [])

    const handleSaveOverrides = useCallback(
        ({ magentoUrl }) => {
            setOverrideMagentoUrl(magentoUrl)
            handleClearCache()
        },
        [setOverrideMagentoUrl]
    )

    useEffect(() => {
        if (overrideMagentoUrl) {
            setCookie('MAGENTO_URL', overrideMagentoUrl, 365)
        } else {
            deleteCookie('MAGENTO_URL')
        }

        fetchDetails() // fetch new data
    }, [overrideMagentoUrl])

    return (
        <React.Fragment>
            <Root>
                <Details>
                    {loading || !data?.storeConfig ? (
                        <Loader arial-label="loading server details" />
                    ) : (
                        <React.Fragment>
                            <Label>Version</Label>
                            <Value>{version}</Value>

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
                            name="magentoUrl"
                            label="Magento URL"
                            defaultValue={overrideMagentoUrl}
                            placeholder={defaults.magentoUrl}
                            style={{ textOverflow: 'ellipsis' }}
                        />
                        <Buttons>
                            <Button type="submit">Save Changes</Button>
                            {/* <Button type="buttom" onClick={handleClearCache} secondary>
                                Clear Cache
                            </Button> */}
                        </Buttons>
                    </Form>
                </Overrides>
            </Root>
        </React.Fragment>
    )
}
