import React from 'react'
import { NextPage } from 'next'

import HomeTemplate from '../components/Home'

const Home: NextPage = () => {
    return <HomeTemplate id={process.env.HOME_PAGE_ID} categoriesParentId={process.env.CATEGORIES_PARENT_ID} />
}

export default Home
