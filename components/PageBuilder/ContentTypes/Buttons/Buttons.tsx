import React from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import { Root } from './Buttons.styled'

export type ButtonsProps = {
    appearance?: 'stacked' | 'inline'
    sameWidth?: 'true' | 'false'
}

export const Buttons: Component<ButtonsProps> = ({
    children,
    appearance = 'inline',
    sameWidth = false,
    style,
    ...props
}) => {
    return (
        <Root $appearance={appearance} $sameWidth={sameWidth == 'true'} {...props}>
            {children}
        </Root>
    )
}
