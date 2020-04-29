import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { StoryStoreProvider } from '~/lib/storystore'

import App from '~/components/App'
import SettingsTemplate from '~/components/Settings'

type SettingsProps = {
    defaults: any
}

const Settings: NextPage<SettingsProps> = () => {
    const defaults = {
        magentoUrl: process.env.MAGENTO_URL,
        homePageId: process.env.HOME_PAGE_ID,
        footerBlockId: process.env.FOOTER_BLOCK_ID,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    }

    return (
        <StoryStoreProvider>
            <App>
                <SettingsTemplate defaults={defaults} />
            </App>
        </StoryStoreProvider>
    )
}

export default withApollo({ ssr: false })(Settings)
