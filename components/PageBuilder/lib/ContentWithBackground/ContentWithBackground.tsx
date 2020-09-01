import React, { useMemo, useRef, useEffect } from 'react'
import { Component, Props } from '@storystore/ui/dist/lib'
import { Root, BgImage, Content } from './ContentWithBackground.styled'
import { LazyImageFull, ImageState } from 'react-lazy-images'
import { BackgroundVideoProps } from './BackgroundVideo'
import dynamic from 'next/dynamic'
import { resolveImage } from '~/lib/resolveImage'
import { createGlobalStyle } from 'styled-components'

const BackgroundStyles = createGlobalStyle`
    html:not(.webp) {
        & .BgImage-mobile.webp,
        & .BgImage-desktop.webp {
            display: none;
        }
    }

    html.webp {
        & .BgImage-mobile.original,
        & .BgImage-desktop.original {
            display: none;
        }
    }

    .BgImage-mobile {
        @media ${props => (props.theme as any).breakpoints.medium} {
            display: none;
        }
    }

    .BgImage-mobile ~ .BgImage-desktop {
        @media ${props => (props.theme as any).breakpoints.smallOnly} {
            display: none;
        }
    }
`

const BackgroundVideo = dynamic(() => import('./BackgroundVideo'), { ssr: false })

export type ParallaxProps = {
    speed: number
}

export type ContentWithBackgroundProps = Props<{
    backgroundImages?: {
        desktop: string
        mobile?: string
    }
    fullScreen?: boolean
    parallax?: ParallaxProps
    video?: BackgroundVideoProps
    loadEagerly?: boolean
}>

const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAFCAQAAADIpIVQAAAADklEQVR42mNkgAJGIhgAALQABsHyMOcAAAAASUVORK5CYII='

export const ContentWithBackground: Component<ContentWithBackgroundProps> = ({ backgroundImages, video, fullScreen, parallax, children, style, loadEagerly, ...props }) => {
    const backgroundRef = useRef<HTMLDivElement>(null)

    const backgroundElem = backgroundRef.current

    // Background Images
    const bg = useMemo(
        () =>
            backgroundImages && {
                mobile: backgroundImages?.mobile && resolveImage(backgroundImages.mobile),
                mobileWebP: backgroundImages?.mobile && resolveImage(backgroundImages.mobile, { type: 'webp' }),
                desktop: resolveImage(backgroundImages.desktop),
                desktopWebP: resolveImage(backgroundImages.desktop, { type: 'webp' }),
            },
        [backgroundImages]
    )

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

    const renderMedia = useMemo(() => {
        if (video) {
            return <BackgroundVideo {...video} parallaxSpeed={parallax?.speed ?? 1} />
        }

        if (bg?.desktop) {
            if (parallax) {
                return (
                    <>
                        {/* Mobile (w/ Parallax) */}
                        {bg.mobileWebP && <BgImage ref={backgroundRef} $loaded style={{ ...styles.background, backgroundImage: `url('${bg.mobileWebP}')` }} className="BgImage-mobile webp" />}
                        {bg.mobile && <BgImage ref={backgroundRef} $loaded style={{ ...styles.background, backgroundImage: `url('${bg.mobile}')` }} className="BgImage-mobile original" />}

                        {/* Desktop (w/ Parallax) */}
                        <BgImage ref={backgroundRef} $loaded style={{ ...styles.background, backgroundImage: `url('${bg.desktopWebP}')` }} className="BgImage-desktop webp" />
                        <BgImage ref={backgroundRef} $loaded style={{ ...styles.background, backgroundImage: `url('${bg.desktop}')` }} className="BgImage-desktop original" />
                    </>
                )
            }

            return (
                <>
                    {/* Mobile */}
                    {bg.mobileWebP && (
                        <div className="BgImage-mobile webp">
                            <LazyImageFull src={bg.mobileWebP} loadEagerly={loadEagerly}>
                                {({ imageState, ref }) => {
                                    const loaded = imageState === ImageState.LoadSuccess
                                    return <BgImage $loaded={loaded} ref={ref} style={{ ...styles.background, backgroundImage: `url('${loaded ? bg.mobileWebP : placeholder}')` }} />
                                }}
                            </LazyImageFull>
                        </div>
                    )}

                    {bg.mobile && (
                        <div className="BgImage-mobile original">
                            <LazyImageFull src={bg.mobile} loadEagerly={loadEagerly}>
                                {({ imageState, ref }) => {
                                    const loaded = imageState === ImageState.LoadSuccess
                                    return <BgImage $loaded={loaded} ref={ref} style={{ ...styles.background, backgroundImage: `url('${loaded ? bg.mobile : placeholder}')` }} />
                                }}
                            </LazyImageFull>
                        </div>
                    )}

                    {/* Desktop */}
                    {bg.desktopWebP && (
                        <div className="BgImage-desktop webp">
                            <LazyImageFull src={bg.desktopWebP} loadEagerly={loadEagerly}>
                                {({ imageState, ref }) => {
                                    const loaded = imageState === ImageState.LoadSuccess
                                    return <BgImage $loaded={loaded} ref={ref} style={{ ...styles.background, backgroundImage: `url('${loaded ? bg.desktopWebP : placeholder}')` }} />
                                }}
                            </LazyImageFull>
                        </div>
                    )}

                    {bg.desktop && (
                        <div className="BgImage-desktop original">
                            <LazyImageFull src={bg.desktop} loadEagerly={loadEagerly}>
                                {({ imageState, ref }) => {
                                    const loaded = imageState === ImageState.LoadSuccess
                                    return <BgImage $loaded={loaded} ref={ref} style={{ ...styles.background, backgroundImage: `url('${loaded ? bg.desktop : placeholder}')` }} />
                                }}
                            </LazyImageFull>
                        </div>
                    )}
                </>
            )
        }

        return null
    }, [bg, loadEagerly, parallax, styles, video])

    return (
        <>
            <BackgroundStyles />
            <Root $fullScreen={fullScreen} $backgroundColor={styles.background.backgroundColor ?? 'transparent'} style={styles.wrapper} {...props}>
                {renderMedia}
                <Content>{children}</Content>
            </Root>
        </>
    )
}
