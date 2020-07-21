import React from 'react'

import { NextPage } from 'next'

import SearchTemplate from '~/components/Search'

type SearchProps = {}

const Search: NextPage<SearchProps> = ({}) => {
    return <SearchTemplate />
}

// Enable next.js ssr
Search.getInitialProps = async () => {}

export default Search
