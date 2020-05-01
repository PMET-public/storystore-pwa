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

Search.getInitialProps = async () => ({}) // Enable next.js ssr

export default withApollo(Search)
