import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { pbStyle } = elem.dataset

    const hrElement = elem.children[0] as HTMLElement

    return {
        'data-pb-style': pbStyle,
        style,
        line: {
            style: getStyleAsObject(hrElement.style),
        },
    }
}

export default { component, props }
