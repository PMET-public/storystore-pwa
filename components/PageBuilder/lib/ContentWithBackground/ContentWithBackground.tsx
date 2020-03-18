import React, { useMemo, useRef, useEffect } from 'react'
import { Component, Props } from '@pmet-public/luma-ui/dist/lib'
import { Root, BgImage, Content } from './ContentWithBackground.styled'

import { Image, useImage } from '@pmet-public/luma-ui/dist/hooks/useImage'

export type ParallaxProps = {
    speed: number
}

export type ContentWithBackgroundProps = Props<{
    backgroundImages?: Image
    fullScreen?: boolean
    parallax?: ParallaxProps
}>

export const ContentWithBackground: Component<ContentWithBackgroundProps> = ({
    backgroundImages,
    fullScreen,
    parallax,
    children,
    style,
    ...props
}) => {
    const elemRef = useRef(null)

    const backgroundRef = useRef(null)

    const backgroundElem = backgroundRef.current

    // Background IMage
    const bgImage = useImage(elemRef, backgroundImages, { lazyload: { offsetY: 100 } })

    // Styles
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
    }, [style])

    // Parallax
    useEffect(() => {
        if (!backgroundElem || !parallax) return

        const { jarallax } = require('jarallax')

        const { speed } = parallax

        jarallax(backgroundElem, {
            speed,
            imgSize: styles.background.backgroundSize,
            imgPosition: styles.background.backgroundPositionX,
            imgRepeat: styles.background.backgroundRepeatX ? 'repeat' : 'no-repeat',
        })
    }, [backgroundElem, parallax])

    return (
        <Root
            $fullScreen={fullScreen}
            $backgroundColor={styles.background.backgroundColor || 'transparent'}
            ref={elemRef}
            style={styles.wrapper}
            {...props}
        >
            {bgImage.src && (
                <BgImage
                    $src={bgImage.src}
                    $loaded={bgImage.loaded}
                    $error={bgImage.error}
                    ref={backgroundRef}
                    style={styles.background}
                />
            )}
            <Content>{children}</Content>
        </Root>
    )
}
