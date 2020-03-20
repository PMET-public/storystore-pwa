import React from 'react'
import { NextPage } from 'next'

import SettingsTemplate, { SettingsProps } from '../components/Settings'

const Settings: NextPage<SettingsProps> = ({ ...props }) => {
    return <SettingsTemplate {...props} />
}

Settings.getInitialProps = async () => {
    const { MAGENTO_URL, HOME_PAGE_ID, CATEGORIES_PARENT_ID, FOOTER_BLOCK_ID, GOOGLE_MAPS_API_KEY } = process.env

    return {
        defaults: {
            MAGENTO_URL,
            HOME_PAGE_ID,
            CATEGORIES_PARENT_ID,
            FOOTER_BLOCK_ID,
            GOOGLE_MAPS_API_KEY,
        },
    }
}

export default Settings
