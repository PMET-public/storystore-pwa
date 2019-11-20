import React, { FunctionComponent } from 'react'
import ErrorTemplate, { ErrorTypes } from '@pmet-public/luma-ui/dist/components/Error'
import Button from '@pmet-public/luma-ui/dist/components/Button'
import Link from '../Link'

type ErrorProps = {
    type?: ErrorTypes
}

const messages = {
    Offline: `You're offline. Check your connection and try again.`,
    '500': 'Internal Error',
    '404': (
        <>
            <div>Oops! The page you landed on doesn't exist.</div>
            <Button as={Link} href="/" style={{ marginTop: '2rem' }}>
                Look around
            </Button>
        </>
    ),
}

export const Error: FunctionComponent<ErrorProps> = ({ type = '500', children = messages[type] }) => {
    return <ErrorTemplate type={type}>{children}</ErrorTemplate>
}
