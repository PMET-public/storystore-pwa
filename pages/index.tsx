import React from 'react'
import { NextPage, GetServerSideProps } from 'next'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'

import HomeTemplate from '../components/Home'

type HomeProps = {
    HOME_PAGE_ID: string
}

const Home: NextPage<HomeProps> = ({ HOME_PAGE_ID }) => {
    return <HomeTemplate id={HOME_PAGE_ID} />
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    return {
        props: {
            HOME_PAGE_ID: process.env.HOME_PAGE_ID,
            ...overrideSettingsFromCookie('HOME_PAGE_ID')(req?.headers),
        },
    }
}

export default Home
