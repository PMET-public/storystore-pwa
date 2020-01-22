import React from 'react'
import { NextPage } from 'next'

import HomeTemplate from '../components/Home'

const homePageId = process.env.homePageId
const categoryParentId = process.env.categoryParentId

const Home: NextPage = () => {
    return <HomeTemplate id={homePageId} categoryParentId={categoryParentId} />
}

export default Home
