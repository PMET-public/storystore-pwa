import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import { Root } from './Html.styled'
import useHtml from '../../../../hooks/useHtml'

export type HtmlProps = {
    source: string
}

export const Html: Component<HtmlProps> = ({ source, ...props }) => {
    const html = useHtml(source)
    return <Root {...props}>{html}</Root>
}
