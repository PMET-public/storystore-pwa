import React, { useMemo, useRef, useEffect } from 'react'
import { Component, Props } from '@pmet-public/storystore-ui/dist/lib'
import { Root, BgImage, Content } from './ContentWithBackground.styled'
import { LazyImageFull, ImageState } from 'react-lazy-images'

import { useImage, ImgSrc } from '@pmet-public/storystore-ui/dist/hooks/useImage'

export type ParallaxProps = {
    speed: number
}

export type ContentWithBackgroundProps = Props<{
    backgroundImages?: ImgSrc
    fullScreen?: boolean
    parallax?: ParallaxProps
}>

export const ContentWithBackground: Component<ContentWithBackgroundProps> = ({ backgroundImages, fullScreen, parallax, children, style, ...props }) => {
    const backgroundRef = useRef(null)

    const backgroundElem = backgroundRef.current

    // Background IMage
    const bgImage = useImage(backgroundImages)

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

        return () => {
            jarallax(backgroundElem, 'destroy')
        }
    }, [backgroundElem, parallax, styles.background.backgroundSize, styles.background.backgroundPositionX, styles.background.backgroundRepeatX])

    return (
        <Root $fullScreen={fullScreen} $backgroundColor={styles.background.backgroundColor || 'transparent'} style={styles.wrapper} {...props}>
            {bgImage &&
                (parallax ? (
                    <BgImage $src={bgImage} $loaded style={styles.background} ref={backgroundRef} />
                ) : (
                    <LazyImageFull src={bgImage}>
                        {({ imageState, ref }) => {
                            return imageState === ImageState.LoadSuccess ? (
                                <BgImage $src={bgImage} $loaded style={styles.background} ref={backgroundRef} />
                            ) : (
                                <BgImage
                                    $src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAFCAQAAADIpIVQAAAADklEQVR42mNkgAJGIhgAALQABsHyMOcAAAAASUVORK5CYII="
                                    style={styles.background}
                                    ref={ref}
                                />
                            )
                        }}
                    </LazyImageFull>
                ))}
            <Content>{children}</Content>
        </Root>
    )
}
