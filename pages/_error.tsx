import React from 'react'
import { NextPage } from 'next'
import ErrorComponent from '~/components/Error'

const Error: NextPage = () => {
    return <ErrorComponent type="500" button={{ text: 'Reload App', onClick: () => window.location.reload() }} fullScreen />
}

export default Error
