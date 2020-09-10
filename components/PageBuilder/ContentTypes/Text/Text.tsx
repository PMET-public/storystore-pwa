import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import { Root } from './Text.styled'
import useHtml from '../../../../hooks/useHtml'

export const Text: Component = ({ innerHTML, ...props }) => {
    const html = useHtml(innerHTML)
    return <Root {...props}>{html}</Root>
}
