import React from 'react'
import { NextPage } from 'next'

import HomeTemplate from '../components/Home'

const homePageId = process.env.HOME_PAGE_ID
const categoryParentId = process.env.CATEGORIES_PARENT_ID

const Home: NextPage = () => {
    return <HomeTemplate id={homePageId} categoryParentId={categoryParentId} />
}

export default Home
