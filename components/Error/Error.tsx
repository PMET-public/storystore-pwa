import React, { FunctionComponent } from 'react'
import ErrorTemplate, { ErrorTypes } from '@pmet-public/luma-ui/dist/components/Error'
import Button, { ButtonProps } from '@pmet-public/luma-ui/dist/components/Button'

type ErrorProps = {
    type?: ErrorTypes
    button?: ButtonProps
    fullScreen?: boolean
}

const messages = {
    Offline: `You're offline. Check your connection and try again.`,
    '500': `Internal Error`,
    '401': `Authorization Required.`,
    '404': `Oops! The page you landed on doesn't exist.`,
}

export const Error: FunctionComponent<ErrorProps> = ({
    type = '500',
    fullScreen = false,
    button,
    children = messages[type],
}) => {
    return (
        <ErrorTemplate type={type} style={fullScreen ? { position: 'fixed', top: 0, left: 0, right: 0 } : {}}>
            <div>{children}</div>
            {button && <Button {...button} style={{ marginTop: '2rem' }} />}
        </ErrorTemplate>
    )
}
