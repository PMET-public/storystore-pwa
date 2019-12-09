import React, { useMemo, useContext, useRef } from 'react'
import { Component, Props } from '@pmet-public/luma-ui/dist/lib'
import { Root, BgImage, Content } from './ContentWithBackground.styled'

import { ThemeContext } from 'styled-components'
import { Image, useImage } from '@pmet-public/luma-ui/dist/hooks/useImage'
import { useMeasure } from '@pmet-public/luma-ui/dist/hooks/useMeasure'

export type ContentWithBackgroundProps = Props<{
    backgroundImages?: Image
    fullScxreen?: boolean
}>

export const ContentWithBackground: Component<ContentWithBackgroundProps> = ({
    backgroundImages,
    fullScreen,
    children,
    style,
    ...props
}) => {
    const elemRef = useRef(null)

    const { offsetY } = useMeasure(elemRef)

    const bgImage = useImage(backgroundImages, offsetY - 200)

    const { colors } = useContext(ThemeContext)

    const styles: { [key: string]: any } = useMemo(() => {
        if (!style) return {}

        const background: { [key: string]: string } = {}
        const wrapper: { [key: string]: string } = {}

        Object.keys(style).forEach(s => {
            if (s.match(/^background(.*)$/)) background[s] = style[s]
            else wrapper[s] = style[s]
        })

        return {
            background,
            wrapper,
        }
    }, [JSON.stringify(style)])

    return (
        <Root
            $fullScreen={fullScreen}
            $backgroundColor={styles.background.backgroundColor || bgImage.src ? colors.onSurface5 : 'transparent'}
            ref={elemRef}
            style={styles.wrapper}
            {...props}
        >
            {bgImage.src && (
                <BgImage $src={bgImage.src} $loaded={bgImage.loaded} $error={bgImage.error} style={styles.background} />
            )}
            <Content>{children}</Content>
        </Root>
    )
}
