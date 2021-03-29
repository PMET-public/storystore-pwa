import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, sameWidth, pbStyle } = elem.dataset

    return {
        'data-pb-style': pbStyle,
        appearance,
        sameWidth,
        style,
    }
}

export default { component, props }
