import React from 'react'
import { Component } from 'luma-ui/dist/lib'
import Html, { HtmlProps } from 'luma-ui/dist/components/Html'
import { Root } from './Text.styled'

export type TextProps = HtmlProps

export const Text: Component<TextProps> = ({ children, ...props }) => {
    return <Root as={Html} {...props} />
}
