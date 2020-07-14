import React from 'react'
import { AppProps } from 'next/app'

import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import App, { useApp } from '~/components/App'

const MyApp = ({ Component, pageProps }: AppProps) => {
    const app = useApp()

    return (
        <App {...(pageProps.app ?? app)}>
            <Component {...pageProps} />
        </App>
    )
}

export default withApollo(withStoryStore(MyApp))
