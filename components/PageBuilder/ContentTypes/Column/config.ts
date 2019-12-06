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

    return { appearance, background, style }
}

export default { component, props }
