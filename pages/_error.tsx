import React from 'react'
import { NextPage } from 'next'
import ErrorComponent from '~/components/Error'
import { withApollo } from '~/lib/apollo/withApollo'

import App from '~/components/App'

const Error: NextPage = () => {
    return (
        <App>
            <ErrorComponent type="500" button={{ text: 'Reload App', onClick: () => window.location.reload() }} fullScreen />
        </App>
    )
}

export default withApollo(Error)
