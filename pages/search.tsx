import React from 'react'
import { NextPage } from 'next'
import SearchTemplate from '~/components/Search'
import { initializeApollo } from '~/lib/apollo/client'
import { APP_QUERY } from '~/components/App'
import { useRouter } from 'next/router'
import { PRODUCTS_QUERY } from '~/components/Products'

const Search: NextPage = () => {
    const router = useRouter()

    const query = router.query?.query?.toString() ?? ''

    return <SearchTemplate query={query} />
}

Search.getInitialProps = async ({ req, res, query }) => {
    if (!req) return {} // csr

    if (Boolean(process.env.CLOUD_MODE) === false) {
        res?.setHeader('cache-control', 's-maxage=1, stale-while-revalidate')
    }

    const apolloClient = initializeApollo(null, req.headers.cookie)

    // SSR Queries
    await apolloClient.query({ query: APP_QUERY }) // Preload App Data

    await apolloClient.query({ query: PRODUCTS_QUERY, variables: { search: query.query ?? '', filters: {} } }) // Preload App Data

    return {
        initialState: apolloClient.cache.extract(),
    }
}

export default Search
