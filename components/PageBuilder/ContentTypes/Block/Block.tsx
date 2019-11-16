import React from 'react'
import { Component } from 'luma-ui/dist/lib'
// import { Root } from './Block.styled'

import PageBuilder, { PageBuilderProps } from '../..'

export type BlockProps = PageBuilderProps

export const Block: Component<BlockProps> = ({ children, ...props }) => {
    return <PageBuilder {...props} />
}
