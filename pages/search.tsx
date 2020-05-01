import React from 'react'

import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import { useRouter } from 'next/router'

import App from '~/components/App'
import SearchTemplate from '~/components/Search'

type SearchProps = {}

const Search: NextPage<SearchProps> = ({}) => {
    const router = useRouter()

    return (
        <App router={router}>
            <SearchTemplate />
        </App>
    )
}

Search.getInitialProps = async () => ({}) // Enable next.js ssr

export default withApollo(Search)
