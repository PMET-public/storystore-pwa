import React from 'react'
import { Component } from '@storystore/ui/dist/lib'

import ContentWithBackground, { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

export type TabItemProps = {
    background: ContentWithBackgroundProps
}

export const TabItem: Component<TabItemProps> = ({ background, children, ...props }) => {
    return (
        <ContentWithBackground {...background} {...props}>
            {children}
        </ContentWithBackground>
    )
}
