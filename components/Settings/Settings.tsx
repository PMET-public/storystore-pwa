import React, { FunctionComponent, useState, useCallback, useRef } from 'react'
import { Root, Wrapper, Buttons, Title, Details, Label, Value, WarningList, WarningItem } from './Settings.styled'
import { version } from '~/package.json'

import IconWarning from 'remixicon/icons/System/error-warning-line.svg'

import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'

import Form, { Input, FormContext } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { Response } from '~/pages/api/check-endpoint'

const toast = process.browser ? require('react-toastify').toast : {}

const addCredentialsToMagentoUrls = (url: string) => {
    const noCredentialsRegex = /^((?!@).)*$/
    const magentoCloudRegex = /^https?:\/\/.*\-.*\-(.*)\.demo\.magentosite\.cloud/
    const $p = ((noCredentialsRegex.test(url) && url.match(magentoCloudRegex)) || [])[1]

    return $p ? url.replace(/(^https?:\/\/)/, ($1: string) => `${$1}admin:${$p}@`) : url
}

type SettingsProps = {}

export const Settings: FunctionComponent<SettingsProps> = () => {
    const { settings, setMagentoUrl, reset } = useStoryStore()

    const formRef = useRef<FormContext>()

    const [saving, setSaving] = useState(false)

    const handleInputOnFocus = useCallback((event: FocusEvent) => {
        // @ts-ignore
        event.currentTarget?.select()
    }, [])

    const handleSaveOverrides = useCallback(
        async payload => {
            setSaving(true)

            if (payload.magentoUrl) {
                try {
                    payload.magentoUrl = addCredentialsToMagentoUrls(payload.magentoUrl)

                    const res = await fetch(`/api/check-endpoint?url=${payload.magentoUrl}`)

                    const data: Response = await res.json()

                    if (data?.errors) {
                        data.errors.forEach(error => {
                            formRef.current?.setError(error.key, error.level, error.message)
                        })
                        throw Error
                    }

                    setMagentoUrl(payload.magentoUrl)

                    toast.success('👍 Saved!')
                } catch (e) {
                    console.error(e)
                    toast.error('💩 There was an issue. Try again.')
                }
            }

            setSaving(false)
        },
        [setMagentoUrl, setSaving, formRef]
    )

    const handleOnResetToDefaults = useCallback(async () => {
        setSaving(true)
        reset()
        toast.success('👍 Saved!')
        setSaving(false)
    }, [reset, setSaving])

    return (
        <Root>
            <Title>Storefront Settings</Title>
            <Wrapper>
                <Details>
                    <Label>PWA Version</Label>
                    <Value>{version}</Value>
                </Details>

                <Details>
                    <Label>Magento Version</Label>
                    <Value>{settings.version || 'n/a'}</Value>
                </Details>

                <Form
                    key={settings.baseUrl}
                    options={{
                        mode: 'onSubmit',
                        reValidateMode: 'onSubmit',
                        defaultValues: {
                            magentoUrl: settings.baseUrl,
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

                <WarningList>
                    {!settings.version && (
                        <WarningItem>
                            <IconWarning />
                            You are missing StoryStore Module
                        </WarningItem>
                    )}
                </WarningList>
            </Wrapper>
        </Root>
    )
}
