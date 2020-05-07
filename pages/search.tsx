import React from 'react'

import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import App from '~/components/App'
import SearchTemplate from '~/components/Search'

type SearchProps = {}

const Search: NextPage<SearchProps> = ({}) => {
    return (
        <App>
            <SearchTemplate />
        </App>
    )
}

// Enable next.js ssr
Search.getInitialProps = async ({ res }) => {
    if (!Boolean(process.env.DEMO_MODE)) {
        res?.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    }
    return {}
}

export default withApollo(Search)
