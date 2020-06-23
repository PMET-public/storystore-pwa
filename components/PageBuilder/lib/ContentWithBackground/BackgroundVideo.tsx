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

export const BackgroundVideo: FunctionComponent<BackgroundVideoProps> = ({ src, fallbackSrc, loop, playOnlyVisible, lazyLoading, overlayColor, parallaxSpeed = 1, ...props }) => {
    const backgroundRef = useRef<any>(null)

    const backgroundElem = backgroundRef.current

    useEffect(() => {
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
    }, [backgroundElem, src, fallbackSrc, loop, playOnlyVisible, lazyLoading, overlayColor, parallaxSpeed])

    return <Root ref={backgroundRef} style={{ backgroundColor: overlayColor }} {...props} />
}

export default BackgroundVideo
