import React from 'react'
import { NextPage, GetServerSideProps } from 'next'
import { useStoryStore } from '~/lib/storystore'
import HomeTemplate, { HOME_PAGE_QUERY } from '~/components/Home'
import { APP_QUERY } from '~/components/App'
import { initializeApollo } from '~/lib/apollo/client'
import { useQuery } from '@apollo/client'

const Home: NextPage<{ homePageId: string }> = ({ homePageId }) => {
    const { settings } = useStoryStore()

    const home = useQuery(HOME_PAGE_QUERY, {
        variables: { id: homePageId ?? settings.homePageId },
    })

    return <HomeTemplate {...home} />
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    if (!Boolean(process.env.CLOUD_MODE)) {
        // Vercel Edge Caching
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    }

    const apolloClient = initializeApollo(null, req.headers.cookie)

    // SSR Queries
    const app = await apolloClient.query({ query: APP_QUERY }) // Preload App Data

    const homePageId = app.data?.storyStore.homePage || app.data?.storeConfig.homePage

    await apolloClient.query({ query: HOME_PAGE_QUERY, variables: { id: homePageId } })

    return {
        props: {
            homePageId,
            initialState: apolloClient.cache.extract(),
        },
    }
}

export default Home
