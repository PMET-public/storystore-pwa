import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import { Root, Wrapper } from './Row.styled'
import ContentWithBackground, { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

export type RowProps = {
    appearance?: 'contained' | 'full-width' | 'full-bleed' | 'full-screen'
    background?: ContentWithBackgroundProps
    enableParallax?: boolean
    parallaxSpeed?: number
}

export const Row: Component<RowProps> = ({ appearance = 'contained', background, children, enableParallax, parallaxSpeed = 1, ...props }) => {
    const contained = appearance === 'contained' || appearance === 'full-width'

    const fullScreen = appearance === 'full-screen'

    return (
        <Root $contained={appearance === 'contained'} {...props}>
            <ContentWithBackground parallax={(enableParallax && { speed: parallaxSpeed }) || undefined} fullScreen={fullScreen} {...background}>
                <Wrapper $contained={contained} $margin={contained}>
                    {children}
                </Wrapper>
            </ContentWithBackground>
        </Root>
    )
}
