import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import StoryStoreProvider, { StoryStore } from '~/lib/storystore'

import { useRouter } from 'next/router'

import App from '~/components/App'
import HomeTemplate from '../components/Home'

type HomeProps = {
    storyStore: StoryStore
}

const Home: NextPage<HomeProps> = ({ storyStore }) => {
    const router = useRouter()

    return (
        <StoryStoreProvider {...storyStore}>
            <App router={router}>
                <HomeTemplate />
            </App>
        </StoryStoreProvider>
    )
}

Home.getInitialProps = async ({ req }) => {
    return {
        storyStore: {
            cookie: req?.headers.cookie,
        },
    }
}

export default withApollo({ ssr: true })(Home)
