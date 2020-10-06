import React, { FunctionComponent } from 'react'
import { NextPage, GetStaticProps } from 'next'
import SettingsTemplate, { SETTINGS_QUERY } from '~/components/Settings'
import Error from '@storystore/ui/dist/components/Error'
import { useQuery } from '@apollo/client'

const Form: FunctionComponent = () => {
    const settings = useQuery(SETTINGS_QUERY)

    return <SettingsTemplate {...settings} />
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
