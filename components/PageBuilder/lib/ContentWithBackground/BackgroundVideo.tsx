import React, { useRef, useEffect, FunctionComponent } from 'react'
import { Root } from './BackgroundVideo.styled'

import { jarallax, jarallaxVideo } from 'jarallax'

jarallaxVideo()

export type BackgroundVideoProps = {
    src?: string
    fallbackSrc?: string
    loop?: boolean
    playOnlyVisible?: boolean
    lazyLoading?: boolean
    overlayColor?: string
    parallaxSpeed?: number
}

export const BackgroundVideo: FunctionComponent<BackgroundVideoProps> = ({ src, fallbackSrc, loop, playOnlyVisible, lazyLoading, overlayColor, parallaxSpeed, ...props }) => {
    const backgroundRef = useRef<any>(null)

    useEffect(() => {
        const backgroundElem = backgroundRef.current

        if (!backgroundElem) return

        jarallax(backgroundElem, {
            speed: parallaxSpeed,
            imgSrc: fallbackSrc,
            videoSrc: src,
            videoLoop: loop,
            videoPlayOnlyVisible: playOnlyVisible,
            videoLazyLoading: lazyLoading,
        })

        backgroundElem.jarallax.video?.on('started', () => {
            const self = backgroundElem.jarallax

            if (self.$video) {
                self.$video.style.opacity = 1
            }
        })

        return () => {
            jarallax(backgroundElem, 'destroy')
        }
    }, [backgroundRef, src, fallbackSrc, loop, playOnlyVisible, lazyLoading, overlayColor, parallaxSpeed])

    return <Root ref={backgroundRef} $overlayColor={overlayColor} {...props} />
}

export default BackgroundVideo
