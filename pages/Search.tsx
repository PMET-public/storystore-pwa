import { useRouter } from 'next/router'

import React from 'react'

import SearchTemplate from '../components/Search'

const Search = () => {
    const router = useRouter()

    const { query = '' } = router.query

    return <SearchTemplate query={query.toString()} />
}

export default Search
