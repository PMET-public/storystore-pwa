import React from 'react'
import { Component } from 'luma-ui/dist/lib'
import { Root } from './Html.styled'

import HtmlComponent, { HtmlProps as HtmlComponentProps } from 'luma-ui/dist/components/Html'

export type HtmlProps = HtmlComponentProps

export const Html: Component<HtmlProps> = ({ children, ...props }) => {
    return <Root as={HtmlComponent} {...props} />
}
