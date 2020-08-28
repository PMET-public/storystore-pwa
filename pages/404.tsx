import React from 'react'
import { NextPage } from 'next'
import ErrorComponent from '~/components/Error'
import Link from '~/components/Link'

const Error: NextPage = () => {
    return <ErrorComponent type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
}

export default Error
