import React from 'react'
import { NextPage } from 'next'
import SearchTemplate from '~/components/Search'
import { initializeApollo } from '~/lib/apollo/client'
import { APP_QUERY } from '~/components/App'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { PRODUCTS_QUERY } from '~/components/Products'

const Search: NextPage = () => {
    const router = useRouter()

    const query = router.query?.query?.toString() ?? ''

    const products = useQuery(PRODUCTS_QUERY, {
        variables: {
            search: query,
        },
        fetchPolicy: 'cache-first',
    })

    return <SearchTemplate {...products} query={query} />
}

Search.getInitialProps = async ({ req, query }) => {
    if (!req) return {} // csr

    const apolloClient = initializeApollo(null, req.headers.cookie)

    // SSR Queries
    await apolloClient.query({ query: APP_QUERY }) // Preload App Data

    await apolloClient.query({ query: PRODUCTS_QUERY, variables: { search: query.query ?? '' } }) // Preload App Data

    return {
        initialState: apolloClient.cache.extract(),
    }
}

export default Search
