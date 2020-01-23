import React from 'react'
import getConfig from 'next/config'
import { NextPage } from 'next'

import HomeTemplate from '../components/Home'

const { publicRuntimeConfig } = getConfig()

const homePageId = publicRuntimeConfig.HOME_PAGE_ID
const categoryParentId = publicRuntimeConfig.CATEGORIES_PARENT_ID

const Home: NextPage = () => {
    return <HomeTemplate id={homePageId} categoryParentId={categoryParentId} />
}

Home.getInitialProps = () => ({})

export default Home
