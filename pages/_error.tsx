import React from 'react'
import { NextPage } from 'next'
import ErrorComponent from '~/components/Error'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

const Error: NextPage = () => {
    return <ErrorComponent type="500" button={{ text: 'Reload App', onClick: () => window.location.reload() }} fullScreen />
}

export default withApollo(withStoryStore(Error))
