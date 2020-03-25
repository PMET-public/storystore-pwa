import React from 'react'
import { NextPage } from 'next'

import HomeTemplate from '../components/Home'

type HomeProps = {
    HOME_PAGE_ID: string
    env: NodeJS.ProcessEnv
}

const Home: NextPage<HomeProps> = ({ env }) => {
    return <HomeTemplate id={env.HOME_PAGE_ID} />
}

export default Home
