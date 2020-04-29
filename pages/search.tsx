import React from 'react'

import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { StoryStoreProvider } from '~/lib/storystore'

import App from '~/components/App'
import SearchTemplate from '~/components/Search'

type SearchProps = {
    cookie?: string
}

const Search: NextPage<SearchProps> = ({ cookie }) => {
    return (
        <StoryStoreProvider cookie={cookie}>
            <App>
                <SearchTemplate />
            </App>
        </StoryStoreProvider>
    )
}

Search.getInitialProps = async ({ req }) => {
    return {
        cookie: req?.headers.cookie,
    }
}

export default withApollo({ ssr: true })(Search)
