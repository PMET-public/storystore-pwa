import React, { useMemo, useRef, useEffect } from 'react'
import { Component, Props } from '@storystore/ui/dist/lib'
import { Root, BgImage, Content } from './ContentWithBackground.styled'
import { LazyImageFull, ImageState } from 'react-lazy-images'
import { BackgroundVideoProps } from './BackgroundVideo'
import { useImage, ImgSrc } from '@storystore/ui/dist/hooks/useImage'
import dynamic from 'next/dynamic'

const BackgroundVideo = dynamic(() => import('./BackgroundVideo'), { ssr: false })

export type ParallaxProps = {
    speed: number
}

export type ContentWithBackgroundProps = Props<{
    backgroundImages?: ImgSrc
    fullScreen?: boolean
    parallax?: ParallaxProps
    video?: BackgroundVideoProps
    loadEagerly?: boolean
}>

const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAFCAQAAADIpIVQAAAADklEQVR42mNkgAJGIhgAALQABsHyMOcAAAAASUVORK5CYII='

export const ContentWithBackground: Component<ContentWithBackgroundProps> = ({ backgroundImages, video, fullScreen, parallax, children, style, loadEagerly, ...props }) => {
    const backgroundRef = useRef<HTMLDivElement>(null)

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
        if (!backgroundElem) return

        let jarallax: any

        if (!video && parallax && backgroundElem) {
            const { jarallax: _jarallax } = require('jarallax')

            jarallax = _jarallax

            jarallax(backgroundElem, {
                speed: parallax.speed,
                imgSize: styles.background.backgroundSize,
                imgPosition: styles.background.backgroundPositionX,
                imgRepeat: styles.background.backgroundRepeatX ? 'repeat' : 'no-repeat',
            })
        }

        return () => {
            if (jarallax) {
                jarallax(backgroundElem, 'destroy')
            }
        }
    }, [backgroundElem, parallax, video, styles.background.backgroundSize, styles.background.backgroundPositionX, styles.background.backgroundRepeatX])

    return (
        <Root $fullScreen={fullScreen} $backgroundColor={styles.background.backgroundColor ?? 'transparent'} style={styles.wrapper} {...props}>
            {video ? (
                <BackgroundVideo {...video} parallaxSpeed={parallax?.speed ?? 1} />
            ) : (
                bgImage &&
                (parallax ? (
                    <BgImage ref={backgroundRef} $loaded style={{ ...styles.background, backgroundImage: `url('${bgImage}')` }} />
                ) : (
                    <LazyImageFull src={bgImage}>
                        {({ imageState, ref }) => {
                            const loaded = imageState === ImageState.LoadSuccess

                            return <BgImage $loaded={loaded} ref={ref} style={{ ...styles.background, backgroundImage: `url('${loaded ? bgImage : placeholder}')` }} />
                        }}
                    </LazyImageFull>
                ))
            )}
            <Content>{children}</Content>
        </Root>
    )
}
