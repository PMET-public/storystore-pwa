import React from 'react'
import { NextPage } from 'next'
import { withStoryStore } from '~/lib/storystore'

import { useSettings } from '~/components/Settings/useSettings'

import SettingsTemplate from '~/components/Settings'
import Error from '@storystore/ui/dist/components/Error'

const Settings: NextPage = () => {
    const settings = useSettings()

    return (
        <React.Fragment>
            {Boolean(process.env.CLOUD_MODE) ? (
                <SettingsTemplate {...settings} />
            ) : (
                <Error type="401" button={{ text: 'Go home', onClick: () => (window.location.href = '/') }} fullScreen>
                    Disabled
                </Error>
            )}
        </React.Fragment>
    )
}

export default withStoryStore(Settings)
