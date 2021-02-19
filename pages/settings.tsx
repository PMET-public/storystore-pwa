import React, { FunctionComponent } from 'react'
import { NextPage, GetStaticProps } from 'next'
import SettingsTemplate from '~/components/Settings'
import Error from '@storystore/ui/dist/components/Error'

const Form: FunctionComponent = () => {
    return <SettingsTemplate />
}

const Settings: NextPage<{ enabled?: boolean }> = ({ enabled }) => {
    if (enabled) return <Form />

    return (
        <Error type="401" button={{ text: 'Go home', onClick: () => (window.location.href = '/') }} fullScreen>
            Disabled
        </Error>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: { enabled: !!process.env.CLOUD_MODE },
    }
}

export default Settings
