import React from 'react'
import { Component } from '@pmet-public/storystore-ui/dist/lib'
import { Root } from './Column.styled'

import ContentWithBackground, { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

export type ColumnProps = {
    appearance?: 'align-top' | 'align-center' | 'align-bottom' | 'full-height'
    background?: ContentWithBackgroundProps
    hero?: boolean
}

const getSelfAlignment = (value: 'align-top' | 'align-center' | 'align-bottom' | 'full-height') => {
    switch (value) {
        case 'align-top':
            return 'flex-start'
        case 'align-center':
            return 'center'
        case 'align-bottom':
            return 'flex-end'
        case 'full-height':
        default:
            return 'stretch'
    }
}

export const Column: Component<ColumnProps> = ({ appearance = 'full-height', hero, background, children, style, ...props }) => {
    return (
        <Root $hero={hero} $selfAlignment={getSelfAlignment(appearance)} as={ContentWithBackground} {...background} style={style} {...props}>
            {children}
        </Root>
    )
}
