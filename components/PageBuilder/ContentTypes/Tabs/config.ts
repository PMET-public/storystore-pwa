import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, activeTab } = elem.dataset

    return { style, appearance, activeTab }
}

export default { component, props }
