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
Search.getInitialProps = async ({}) => {
    return {}
}

export default withApollo(Search)
