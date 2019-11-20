import React from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import { Root, Line } from './Divider.styled'

export type DividerProps = {
    line: React.HTMLAttributes<HTMLElement>
}

export const Divider: Component<DividerProps> = ({ children, line, ...props }) => {
    return (
        <Root {...props}>
            <Line {...line} />
        </Root>
    )
}
