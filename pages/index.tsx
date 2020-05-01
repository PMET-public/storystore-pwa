import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'

import { useRouter } from 'next/router'

import App from '~/components/App'
import HomeTemplate from '../components/Home'

type HomeProps = {}

const Home: NextPage<HomeProps> = ({}) => {
    const router = useRouter()

    return (
        <App router={router}>
            <HomeTemplate />
        </App>
    )
}

Home.getInitialProps = async () => ({}) // Enable next.js ssr

export default withApollo(Home)
