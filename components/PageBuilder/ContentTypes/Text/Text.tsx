import React from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import { Root } from './Text.styled'

export type TextProps = {}

export const Text: Component<TextProps> = ({ children, ...props }) => {
    return <Root {...props}>{children}</Root>
}
