import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import App from '~/components/App'
import SettingsTemplate from '~/components/Settings'

type SettingsProps = {
    defaults: any
}

const Settings: NextPage<SettingsProps> = ({}) => {
    const defaults = {
        magentoUrl: process.env.MAGENTO_URL,
        homePageId: process.env.HOME_PAGE_ID,
    }

    return (
        <App>
            <SettingsTemplate defaults={defaults} />
        </App>
    )
}

export default withApollo(Settings)
