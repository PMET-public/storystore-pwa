import React from 'react'
import { NextPage, GetServerSideProps } from 'next'
import SearchTemplate from '~/components/Search'
import { initializeApollo } from '~/lib/apollo/client'
import { APP_QUERY } from '~/components/App'

const Search: NextPage = () => {
    return <SearchTemplate />
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    if (!Boolean(process.env.CLOUD_MODE)) {
        // Vercel Edge Caching
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    }

    const apolloClient = initializeApollo(null, req.headers.cookie)

    // SSR Queries
    await apolloClient.query({ query: APP_QUERY }) // Preload App Data

    return {
        props: {
            initialState: apolloClient.cache.extract(),
        },
    }
}

export default Search
