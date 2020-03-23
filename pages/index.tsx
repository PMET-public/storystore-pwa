import React from 'react'
import { NextPage, GetServerSideProps } from 'next'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'

import HomeTemplate from '../components/Home'

type HomeProps = {
    HOME_PAGE_ID: string
    CATEGORIES_PARENT_ID: string
}

const Home: NextPage<HomeProps> = ({ HOME_PAGE_ID, CATEGORIES_PARENT_ID }) => {
    return <HomeTemplate id={HOME_PAGE_ID} categoriesParentId={CATEGORIES_PARENT_ID} />
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    return {
        props: {
            HOME_PAGE_ID: process.env.HOME_PAGE_ID,
            CATEGORIES_PARENT_ID: process.env.CATEGORIES_PARENT_ID,
            ...overrideSettingsFromCookie('HOME_PAGE_ID', 'CATEGORIES_PARENT_ID')(req?.headers),
        },
    }
}

export default Home
