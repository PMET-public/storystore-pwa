import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    return {
        style,
        as: elem.nodeName.toLowerCase(),
        text: elem.textContent,
    }
}

export default { component, props }
