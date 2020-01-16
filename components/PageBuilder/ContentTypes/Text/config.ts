import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)
    const { innerHTML } = elem

    return {
        style,
        innerHTML,
    }
}

export default { component, props }
