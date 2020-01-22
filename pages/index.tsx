import React from 'react'
import { NextPage } from 'next'
import getConfig from 'next/config'

import HomeTemplate from '../components/Home'

const { publicRuntimeConfig } = getConfig()

const { homePageId, categoryParentId } = publicRuntimeConfig

const Home: NextPage = () => {
    return <HomeTemplate id={homePageId} categoryParentId={categoryParentId} />
}

export default Home
