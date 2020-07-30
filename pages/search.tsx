import React from 'react'
import { NextPage, GetServerSideProps } from 'next'
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
    })

    return <SearchTemplate {...products} query={query} />
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
    if (!Boolean(process.env.CLOUD_MODE)) {
        // Vercel Edge Caching
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    }

    const apolloClient = initializeApollo(null, req.headers.cookie)

    // SSR Queries
    await apolloClient.query({ query: APP_QUERY }) // Preload App Data

    await apolloClient.query({ query: PRODUCTS_QUERY, variables: { search: query.query ?? '' } }) // Preload App Data

    return {
        props: {
            initialState: apolloClient.cache.extract(),
        },
    }
}

export default Search
