import { resolveImage } from './../../../../lib/resolveImage'
import { getBackgroundImages } from '../../lib/utils'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

import component from '.'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, backgroundImages } = elem.dataset

    const fullScreen = elem.classList.contains('full-screen')

    const loadEagerly = elem.classList.contains('load-eagerly')

    const enableParallax = elem.dataset.enableParallax === '1'

    const parallaxSpeed = parseFloat(elem.dataset.parallaxSpeed || '1')

    const background: ContentWithBackgroundProps = {
        loadEagerly,
        backgroundImages: backgroundImages ? getBackgroundImages(backgroundImages) : undefined,
        video:
            elem.dataset.backgroundType === 'video'
                ? {
                      src: elem.dataset.videoSrc,
                      fallbackSrc: elem.dataset.videoFallbackSrc && resolveImage(elem.dataset.videoFallbackSrc),
                      loop: elem.dataset.videoLoop === 'true',
                      playOnlyVisible: elem.dataset.videoPlayOnlyVisible === 'true',
                      lazyLoading: elem.dataset.videoLazyLoad === 'true',
                      overlayColor:
                          appearance === 'full-width' || appearance === 'full-bleed'
                              ? elem.childNodes[0] && (elem.childNodes[0] as HTMLElement).dataset.videoOverlayColor
                              : (elem.childNodes[0] && (elem.childNodes[0] as HTMLElement).dataset.videoOverlayColor) || undefined,
                  }
                : undefined,
    }

    return {
        /**
         * Patch: add "full-screen" appearance based on className for now
         */
        appearance: fullScreen ? 'full-screen' : appearance,
        enableParallax,
        parallaxSpeed,
        background,
        style,
    }
}

export default { component, props }
