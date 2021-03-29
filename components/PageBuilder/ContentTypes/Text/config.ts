import { getStyleAsObject } from '../../lib/getStyleAsObject'

import component from './'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { pbStyle } = elem.dataset

    const { innerHTML } = elem

    return {
        'data-pb-style': pbStyle,
        style,
        innerHTML,
    }
}

export default { component, props }
