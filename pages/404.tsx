import React from 'react'
import { NextPage } from 'next'
import ErrorComponent from '~/components/Error'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import App from '~/components/App'
import Link from '~/components/Link'

const Error: NextPage = () => {
    return (
        <App>
            <ErrorComponent type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
        </App>
    )
}

export default withApollo(withStoryStore(Error))
