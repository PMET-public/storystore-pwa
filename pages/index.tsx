import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

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
    const maxAge = 30 * 86400 // 30 days 31536000
    res?.setHeader('Cache-Control', `max-age=${maxAge}, stale-while-revalidate`)
    return {}
}

export default withApollo(Home)
