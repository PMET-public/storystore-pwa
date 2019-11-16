import dynamic from 'next/dynamic'
import { getBackgroundImages } from '../../lib/utils'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, tabName, backgroundImages } = elem.dataset

    const background: ContentWithBackgroundProps = {
        backgroundImages: backgroundImages ? getBackgroundImages(backgroundImages) : undefined,
    }

    return { appearance, tabName, background, style }
}

export default { component, props }
