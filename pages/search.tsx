import React from 'react'

import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import StoryStoreProvider, { StoryStore } from '~/lib/storystore'

import { useRouter } from 'next/router'

import App from '~/components/App'
import SearchTemplate from '~/components/Search'

type SearchProps = {
    storyStore: StoryStore
}

const Search: NextPage<SearchProps> = ({ storyStore }) => {
    const router = useRouter()

    return (
        <StoryStoreProvider {...storyStore}>
            <App router={router}>
                <SearchTemplate />
            </App>
        </StoryStoreProvider>
    )
}

Search.getInitialProps = async ({ req }) => {
    return {
        storyStore: {
            cookie: req?.headers.cookie,
        },
    }
}

export default withApollo({ ssr: true })(Search)
