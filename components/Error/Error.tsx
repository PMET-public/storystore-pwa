import React from 'react'
import dynamic from 'next/dynamic'

import ErrorTemplate, { ErrorTypes } from '@storystore/ui/dist/components/Error'
import { ButtonProps } from '@storystore/ui/dist/components/Button'
import { Component } from '@storystore/ui/dist/lib'

const Button = dynamic(() => import('@storystore/ui/dist/components/Button'))

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

export const Error: Component<ErrorProps> = ({ type = '500', fullScreen = false, button, children = messages[type], ...props }) => {
    return (
        <ErrorTemplate type={type} {...props} style={{ width: fullScreen ? '100%' : props.style?.width, height: fullScreen ? '100%' : props.styles?.height, ...props.style }}>
            <div>{children}</div>
            {button && <Button {...button} style={{ marginTop: '2rem' }} />}
        </ErrorTemplate>
    )
}
