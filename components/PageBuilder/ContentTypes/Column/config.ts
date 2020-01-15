import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { getBackgroundImages } from '../../lib/utils'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

import component from '.'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, backgroundImages } = elem.dataset

    const background: ContentWithBackgroundProps = {
        backgroundImages: backgroundImages ? getBackgroundImages(backgroundImages) : undefined,
    }

    const hero = elem.classList.contains('hero')

    return { appearance, hero, background, style }
}

export default { component, props }
