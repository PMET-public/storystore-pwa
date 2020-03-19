import React from 'react'
import { NextPage } from 'next'

import SettingsTemplate, { SettingsProps } from '../components/Settings'

const Home: NextPage<SettingsProps> = ({ ...props }) => {
    return <SettingsTemplate {...props} />
}

Home.getInitialProps = async ({}) => {
    const magentoUrl = process.env.MAGENTO_URL
    return {
        defaults: {
            magentoUrl,
        },
    }
}

export default Home
