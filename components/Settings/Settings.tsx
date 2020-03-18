import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { Root, Wrapper } from './Settings.styled'
import { setCookie, getCookie } from '../../lib/cookies'

import { useSettings } from './useSettings'

import Form, { Input } from '@pmet-public/luma-ui/dist/components/Form'
import Button from '@pmet-public/luma-ui/dist/components/Button'

type SettingsProps = {}

export const Settings: FunctionComponent<SettingsProps> = ({}) => {
    const handleUpdateEndpoint = useCallback(({ magentoUrl }) => {
        setCookie('MAGENTO_URL', magentoUrl, 365)
    }, [])

    useEffect(() => {
        console.log(getCookie('MAGENTO_URL'))
    }, [])

    const { data, loading } = useSettings()

    return (
        <Root>
            <Wrapper>
                <Form onSubmit={handleUpdateEndpoint}>
                    <Input
                        name="magentoUrl"
                        label="Magento URL"
                        defaultValue={getCookie('MAGENTO_URL')}
                        rules={{ required: true }}
                    />
                    <Button type="submit">Save</Button>
                </Form>
            </Wrapper>

            <code>{!loading && JSON.stringify(data, undefined, 2)}</code>
        </Root>
    )
}
