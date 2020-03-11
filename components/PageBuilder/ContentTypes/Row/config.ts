import { getBackgroundImages } from '../../lib/utils'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

import component from '.'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, backgroundImages } = elem.dataset

    const background: ContentWithBackgroundProps = {
        backgroundImages: backgroundImages ? getBackgroundImages(backgroundImages) : undefined,
    }

    const fullScreen = elem.classList.contains('full-screen')

    const enableParallax = elem.dataset.enableParallax === '1'

    const parallaxSpeed = parseFloat(elem.dataset.parallaxSpeed || '1')

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
