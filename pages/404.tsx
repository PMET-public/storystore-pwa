import React from 'react'
import { NextPage } from 'next'
import ErrorComponent from '~/components/Error'
import { withStoryStore } from '~/lib/storystore'

import Link from '~/components/Link'

const Error: NextPage = () => {
    return <ErrorComponent type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
}

export default withStoryStore(Error)
