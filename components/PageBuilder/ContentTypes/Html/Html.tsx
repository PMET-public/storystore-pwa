import React from 'react'
import { Component } from '@pmet-public/luma-ui/lib'
import { Root } from './Html.styled'
import useHtml from '../../../../hooks/useHtml'

export type HtmlProps = {
    source: string
}

export const Html: Component<HtmlProps> = ({ children, source, ...props }) => {
    const html = useHtml(source)
    return <Root {...props}>{html}</Root>
}
