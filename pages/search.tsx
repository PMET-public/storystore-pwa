import React from 'react'

import SearchTemplate from '../components/Search'
import { NextPage } from 'next'

type SearchProps = {}

const Search: NextPage<SearchProps> = () => {
    return <SearchTemplate />
}

export default Search
