import React from 'react'
import { Component } from '@pmet-public/luma-ui/src/lib'

import ContentWithBackground, { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

export type TabItemProps = {
    background: ContentWithBackgroundProps
}

export const TabItem: Component<TabItemProps> = ({ background, children, style }) => {
    return (
        <ContentWithBackground {...background} style={style}>
            {children}
        </ContentWithBackground>
    )
}
