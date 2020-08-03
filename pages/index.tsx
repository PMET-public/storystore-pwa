import React from 'react'
import { NextPage } from 'next'
import HomeTemplate, { HOME_PAGE_QUERY } from '~/components/Home'
import { APP_QUERY } from '~/components/App'
import { initializeApollo } from '~/lib/apollo/client'
import { useQuery } from '@apollo/client'
import { useStoryStore } from '~/lib/storystore'

const Home: NextPage = () => {
    const { settings } = useStoryStore()

    const home = useQuery(HOME_PAGE_QUERY, { variables: { id: settings?.homePage }, skip: !settings?.homePage, fetchPolicy: 'cache-first' })

    return <HomeTemplate {...home} />
}

Home.getInitialProps = async ({ req }) => {
    if (!req) return {} // csr

    const apolloClient = initializeApollo(null, req?.headers.cookie)

    const app = await apolloClient.query({ query: APP_QUERY, errorPolicy: 'all' }) // Preload App Data

    const homePage = app.data?.storyStore.homePage || app.data?.storeConfig.homePage

    await apolloClient.query({ query: HOME_PAGE_QUERY, variables: { id: homePage }, errorPolicy: 'all' })

    return {
        initialState: apolloClient.cache.extract(),
    }
}

export default Home
