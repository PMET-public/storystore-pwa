import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import { useRouter } from 'next/router'

import App from '~/components/App'
import SettingsTemplate from '~/components/Settings'

type SettingsProps = {
    defaults: any
}

const Settings: NextPage<SettingsProps> = ({}) => {
    const router = useRouter()

    const defaults = {
        magentoUrl: process.env.MAGENTO_URL,
        homePageId: process.env.HOME_PAGE_ID,
    }

    return (
        <App router={router}>
            <SettingsTemplate defaults={defaults} />
        </App>
    )
}

export default withApollo(Settings)
