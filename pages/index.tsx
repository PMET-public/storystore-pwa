import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import HomeTemplate, { useHome } from '../components/Home'

import useStoryStore from '~/hooks/useStoryStore'

const Home: NextPage = () => {
    const { settings } = useStoryStore()

    const home = useHome({ id: settings.homePageId })

    return <HomeTemplate {...home} />
}

// Enable next.js ssr
Home.getInitialProps = async () => {
    return { includeAppData: true }
}

export default withApollo(withStoryStore(Home))
