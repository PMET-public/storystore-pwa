import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import App from '~/components/App'
import SettingsTemplate from '~/components/Settings'
import Error from '@storystore/ui/dist/components/Error'

type SettingsProps = {}

const Settings: NextPage<SettingsProps> = ({}) => {
    return (
        <App>
            {Boolean(process.env.DEMO_MODE) ? (
                <SettingsTemplate />
            ) : (
                <Error type="401" button={{ text: 'Go home', onClick: () => (window.location.href = '/') }} fullScreen>
                    Disabled
                </Error>
            )}
        </App>
    )
}

export default withApollo(withStoryStore(Settings))
