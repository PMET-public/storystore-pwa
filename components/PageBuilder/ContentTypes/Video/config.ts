import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { pbStyle } = elem.dataset

    return {
        'data-pb-style': pbStyle,
        style,
        url: elem.getElementsByTagName('iframe')[0].getAttribute('src'),
    }
}

export default { component, props }
