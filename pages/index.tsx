import React from 'react'
import { NextPage } from 'next'
import HomeTemplate, { HOME_PAGE_QUERY } from '~/components/Home'
import { APP_QUERY } from '~/components/App'
import { initializeApollo } from '~/lib/apollo/client'
import { useStoryStore } from '~/lib/storystore'

const Home: NextPage = () => {
    const { settings } = useStoryStore()

    return <HomeTemplate id={settings?.homePage} />
}

Home.getInitialProps = async ({ req, res }) => {
    if (!req) return {} // csr

    if (Boolean(process.env.CLOUD_MODE) === false) {
        res?.setHeader('cache-control', 's-maxage=1, stale-while-revalidate')
    }

    const apolloClient = initializeApollo(null, req?.headers.cookie)

    const app = await apolloClient.query({ query: APP_QUERY, errorPolicy: 'all' }) // Preload App Data

    const homePage = app.data?.storyStore.homePage

    await apolloClient.query({ query: HOME_PAGE_QUERY, variables: { id: homePage }, errorPolicy: 'all' })

    return {
        initialState: apolloClient.cache.extract(),
    }
}

export default Home
