import React from 'react'
import { NextPage } from 'next'

import HomeTemplate from '../components/Home'

type HomeProps = {}

const Home: NextPage<HomeProps> = () => {
    return <HomeTemplate />
}

export default Home
