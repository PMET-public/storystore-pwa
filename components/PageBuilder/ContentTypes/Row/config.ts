import { getBackgroundImages } from '../../lib/utils'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

import component from '.'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, backgroundImages } = elem.dataset

    const fullScreen = elem.classList.contains('full-screen')

    const enableParallax = elem.dataset.enableParallax === '1'

    const parallaxSpeed = parseFloat(elem.dataset.parallaxSpeed || '1')

    const background: ContentWithBackgroundProps = {
        backgroundImages: backgroundImages ? getBackgroundImages(backgroundImages) : undefined,
        video:
            elem.dataset.backgroundType === 'video'
                ? {
                      src: elem.dataset.videoSrc,
                      fallbackSrc: elem.dataset.videoFallbackSrc,
                      loop: elem.dataset.videoLoop === 'true',
                      playOnlyVisible: elem.dataset.videoPlayOnlyVisible === 'true',
                      lazyLoading: elem.dataset.videoLazyLoad === 'true',
                  }
                : undefined,
    }

    if (elem.dataset.backgroundType === 'video') {
        style.backgroundColor =
            appearance === 'full-width' || appearance === 'full-bleed'
                ? elem.childNodes[0] && (elem.childNodes[0] as HTMLElement).dataset.videOverlayColor
                : (elem.childNodes[0] && (elem.childNodes[0] as HTMLElement).dataset.videoOverlayColor) || null
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
