import React from 'react'
import { NextPage } from 'next'

import SettingsTemplate, { SettingsProps } from '../components/Settings'

const Settings: NextPage<SettingsProps> = ({ ...props }) => {
    return <SettingsTemplate {...props} />
}

Settings.getInitialProps = async () => {
    return {
        defaults: {
            MAGENTO_URL: process.env.MAGENTO_URL,
            HOME_PAGE_ID: process.env.HOME_PAGE_ID,
            FOOTER_BLOCK_ID: process.env.FOOTER_BLOCK_ID,
            GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        },
    }
}

export default Settings
