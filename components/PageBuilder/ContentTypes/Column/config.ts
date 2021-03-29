import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { getBackgroundImages } from '../../lib/utils'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

import component from '.'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, backgroundImages, pbStyle } = elem.dataset

    const loadEagerly = elem.classList.contains('loading-eager')

    const background: ContentWithBackgroundProps = {
        loadEagerly,
        backgroundImages: backgroundImages ? getBackgroundImages(backgroundImages) : undefined,
    }

    const hero = elem.classList.contains('hero')

    return {
        'data-pb-style': pbStyle,
        appearance,
        hero,
        background,
        style,
    }
}

export default { component, props }
