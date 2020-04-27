import React from 'react'
import { Component } from '@pmet-public/storystore-ui/lib'
import { Root } from './Heading.styled'

export type HeadingProps = {
    as: string
    text: string
}

export const Heading: Component<HeadingProps> = ({ children, as, text, ...props }) => {
    return (
        <Root as={as} {...props}>
            {text}
        </Root>
    )
}
