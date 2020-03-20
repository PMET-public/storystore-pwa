import React from 'react'
import { NextPage } from 'next'
import { getCookieValueFromString, getCookie } from '../lib/cookies'

import HomeTemplate from '../components/Home'

type HomeProps = {
    id: string
    categoriesParentId: string
}

const Home: NextPage<HomeProps> = ({ id, categoriesParentId }) => {
    return <HomeTemplate id={id} categoriesParentId={categoriesParentId} />
}

Home.getInitialProps = async ({ req }) => {
    const id =
        (process.browser
            ? getCookie('HOME_PAGE_ID')
            : req?.headers.cookie && getCookieValueFromString(req.headers.cookie, 'HOME_PAGE_ID')) ||
        process.env.HOME_PAGE_ID

    const categoriesParentId =
        (process.browser
            ? getCookie('CATEGORIES_PARENT_ID')
            : req?.headers.cookie && getCookieValueFromString(req.headers.cookie, 'CATEGORIES_PARENT_ID')) ||
        process.env.CATEGORIES_PARENT_ID

    return {
        id,
        categoriesParentId,
    }
}

export default Home
