import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { StoryStoreProvider } from '~/lib/storystore'

import App from '~/components/App'
import HomeTemplate from '../components/Home'

type HomeProps = {
    cookie?: string
}

const Home: NextPage<HomeProps> = ({ cookie }) => {
    return (
        <StoryStoreProvider cookie={cookie}>
            <App>
                <HomeTemplate />
            </App>
        </StoryStoreProvider>
    )
}

Home.getInitialProps = async ({ req }) => {
    return {
        cookie: req?.headers.cookie,
    }
}

export default withApollo({ ssr: true })(Home)
