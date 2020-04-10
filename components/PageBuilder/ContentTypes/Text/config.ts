import { getStyleAsObject } from '../../lib/getStyleAsObject'

import component from './'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)
    const { innerHTML } = elem

    return {
        style,
        innerHTML,
    }
}

export default { component, props }
