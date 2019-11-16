import React from 'react'
import { Component } from 'luma-ui/dist/lib'
import { Root } from './TabItem.styled'

import ContentWithBackground, { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'
import Accordion from 'luma-ui/dist/components/Accordion'

export type TabItemProps = {
    appearance: string
    tabName: string
    background: ContentWithBackgroundProps
}

export const TabItem: Component<TabItemProps> = ({ appearance, tabName, background, children, style, ...props }) => {
    return (
        <Root>
            <Accordion.Item label={tabName} {...props}>
                <ContentWithBackground {...background} style={style}>
                    {children}
                </ContentWithBackground>
            </Accordion.Item>
        </Root>
    )
}
