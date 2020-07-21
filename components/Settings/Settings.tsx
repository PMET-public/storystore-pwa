import React, { FunctionComponent, useState, useCallback, useRef, useEffect } from 'react'
import { Root, Wrapper, Buttons, Title, Details, Label, Value, RootErrors, ErrorItem, ErrorItemContent, ErrorItemIcon } from './Settings.styled'
import { version } from '~/package.json'

import { useStoryStore } from '~/lib/storystore'
import { SettingsProps } from './useSettings'

import Form, { Input } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { Response } from '~/pages/api/check-endpoint'
import Loader from '@storystore/ui/dist/components/Loader'
import { AnyARecord } from 'dns'

const toast = process.browser ? require('react-toastify').toast : {}

const addCredentialsToMagentoUrls = (url: string) => {
    const noCredentialsRegex = /^((?!@).)*$/
    const magentoCloudRegex = /^https?:\/\/.*\-.*\-(.*)\.demo\.magentosite\.cloud/
    const $p = ((noCredentialsRegex.test(url) && url.match(magentoCloudRegex)) || [])[1]

    return $p ? url.replace(/(^https?:\/\/)/, ($1: string) => `${$1}admin:${$p}@`) : url
}

export const Settings: FunctionComponent<SettingsProps> = ({ data, loading: _loading }) => {
    const { settings, setMagentoUrl, reset } = useStoryStore()

    const [saving, setSaving] = useState(false)

    const loading = saving || _loading

    const formRef = useRef<AnyARecord>()

    const [notices, setNotices] = useState<{ [key: string]: any } | undefined>()

    const handleCheckEndpoint = useCallback(
        async (url: string) => {
            const magentoUrl = addCredentialsToMagentoUrls(url)

            const res = await fetch(`/api/check-endpoint?url=${magentoUrl}`)

            const data: Response = await res.json()

            setNotices({ magentoUrl, ...data })

            if (data?.errors) {
                data.errors.forEach(error => {
                    formRef.current?.setError(error.key, { type: error.level, message: error.message })
                })

                if (data.errors.find(e => e.level === 'error')) {
                    throw new Error()
                }
            }

            return { magentoUrl, ...data }
        },
        [formRef, setNotices]
    )

    const handleInputOnFocus = useCallback((event: FocusEvent) => {
        // @ts-ignore
        event.currentTarget?.select()
    }, [])

    const handleSaveOverrides = useCallback(
        async payload => {
            setSaving(true)
            // setNotices(undefined)

            if (payload.magentoUrl) {
                try {
                    const res = await handleCheckEndpoint(payload.magentoUrl)
                    if (res?.magentoUrl) setMagentoUrl(res.magentoUrl)
                    toast.success('👍 Saved!')
                } catch (error) {
                    toast.error('💩 There was an issue. Try again.')
                }
            }
            setSaving(false)
        },
        [setMagentoUrl, setSaving, handleCheckEndpoint]
    )

    const handleOnResetToDefaults = useCallback(async () => {
        setSaving(true)
        setNotices(undefined)
        formRef.current?.reset()
        reset()
        toast.success('👍 Saved!')
        setSaving(false)
    }, [reset, setSaving, formRef])

    useEffect(() => {
        if (data?.config.baseUrl) {
            handleCheckEndpoint(data.config.baseUrl)
        }
    }, [data, handleCheckEndpoint])

    return (
        <Root>
            <Wrapper>
                <Title>Storefront Settings</Title>
                <Details>
                    <Label>PWA Version</Label>
                    <Value>{version}</Value>
                </Details>

                <Details>
                    <Label>Magento Version</Label>
                    <Value>{settings.version || 'n/a'}</Value>
                </Details>

                <Form
                    key={data?.config.baseUrl}
                    options={{
                        mode: 'onSubmit',
                        reValidateMode: 'onSubmit',
                    }}
                    onSubmit={handleSaveOverrides}
                    ref={formRef}
                >
                    <Input
                        name="magentoUrl"
                        disabled={loading}
                        label="Magento URL"
                        style={{ textOverflow: 'ellipsis' }}
                        onFocus={handleInputOnFocus}
                        defaultValue={data?.config.baseUrl}
                        rules={{
                            pattern: /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
                        }}
                    />

                    <Buttons>
                        <Button type="submit" loading={saving} disabled={loading}>
                            Save Changes
                        </Button>
                        <Button disabled={loading} type="button" secondary onClick={handleOnResetToDefaults}>
                            Reset to Defaults
                        </Button>
                    </Buttons>
                </Form>
            </Wrapper>

            <RootErrors>
                {loading ? (
                    <Loader />
                ) : (
                    notices && (
                        <React.Fragment>
                            {/* Offer to use Previous Version */}
                            {notices.redirectToPrevious && (
                                <ErrorItem $level="error">
                                    <ErrorItemContent>
                                        <ErrorItemIcon>😑</ErrorItemIcon>
                                        PWA Storefront {version} only supports Magento {notices.magentoDependency}. No worries, you can still use the previous version.
                                    </ErrorItemContent>
                                    <Button as="a" href={notices.redirectToPrevious}>
                                        <span>📦</span> Switch to previous release
                                    </Button>
                                </ErrorItem>
                            )}

                            {/* Depracated Message */}
                            {notices.upgrade && (
                                <ErrorItem $level="warning">
                                    <ErrorItemContent>
                                        <ErrorItemIcon>😑</ErrorItemIcon>
                                        You are using a deprecated release of the PWA Storefront. Please make sure to use the latest release of Magento to enable the latest PWA Storefront.
                                    </ErrorItemContent>
                                    {notices.redirectToLatest && (
                                        <Button as="a" href={notices.redirectToLatest}>
                                            <span>🎉</span> Switch to latest release
                                        </Button>
                                    )}
                                </ErrorItem>
                            )}

                            {/* StoryStore Module missing */}
                            {notices.missingStoryStore && (
                                <ErrorItem $level="warning">
                                    <ErrorItemContent>
                                        <ErrorItemIcon>🥺</ErrorItemIcon>
                                        Your Magento seems to be missing the StoryStore Module. Please install in order to personalize the PWA Storefront.
                                    </ErrorItemContent>

                                    <Button as="a" href="https://github.com/PMET-public/module-storystore" target="_blank">
                                        <span>💅</span> Install StoryStore Module
                                    </Button>
                                </ErrorItem>
                            )}
                        </React.Fragment>
                    )
                )}
            </RootErrors>
        </Root>
    )
}
