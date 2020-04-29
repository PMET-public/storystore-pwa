import React from 'react'
import { Component } from '@pmet-public/storystore-ui/dist/lib'
import { Root, Line } from './Divider.styled'

export type DividerProps = {
    line: React.HTMLAttributes<HTMLElement>
}

export const Divider: Component<DividerProps> = ({ line, ...props }) => {
    return (
        <Root {...props}>
            <Line {...line} />
        </Root>
    )
}
