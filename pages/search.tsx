import React from 'react'

import { NextPage } from 'next'
import { withStoryStore } from '~/lib/storystore'

import SearchTemplate from '~/components/Search'

type SearchProps = {}

const Search: NextPage<SearchProps> = ({}) => {
    return <SearchTemplate />
}

// Enable next.js ssr
Search.getInitialProps = async () => {
    return { includeAppData: true }
}

export default withStoryStore(Search)
