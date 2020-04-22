import React from 'react'
import { Component } from '@pmet-public/luma-ui/lib'
import { Root } from './Text.styled'
import useHtml from '../../../../hooks/useHtml'

export type TextProps = {}

export const Text: Component<TextProps> = ({ children, innerHTML, ...props }) => {
    const html = useHtml(innerHTML)
    return <Root {...props}>{html}</Root>
}
