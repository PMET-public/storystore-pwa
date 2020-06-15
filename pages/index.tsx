import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import App from '~/components/App'
import HomeTemplate from '../components/Home'

type HomeProps = {}

const Home: NextPage<HomeProps> = ({}) => {
    return (
        <App>
            <HomeTemplate />
        </App>
    )
}

// Enable next.js ssr
Home.getInitialProps = async ({ res }) => {
    if (!Boolean(process.env.CLOUD_MODE)) {
        res?.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    }

    return {}
}

export default withApollo(withStoryStore(Home))
