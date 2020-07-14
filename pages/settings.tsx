import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import SettingsTemplate from '~/components/Settings'
import Error from '@storystore/ui/dist/components/Error'

type SettingsProps = {
    defaultMagentoUrl: string
}

const Settings: NextPage<SettingsProps> = () => {
    return (
        <React.Fragment>
            {Boolean(process.env.CLOUD_MODE) ? (
                <SettingsTemplate />
            ) : (
                <Error type="401" button={{ text: 'Go home', onClick: () => (window.location.href = '/') }} fullScreen>
                    Disabled
                </Error>
            )}
        </React.Fragment>
    )
}

export default withApollo(withStoryStore(Settings))
