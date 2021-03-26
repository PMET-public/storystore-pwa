import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const { pbStyle } = elem.dataset
    const style = getStyleAsObject(elem.style)

    const html = elem.children[0]?.innerHTML

    return {
        'data-pb-style': pbStyle,
        style,
        html,
    }
}

export default { component, props }
