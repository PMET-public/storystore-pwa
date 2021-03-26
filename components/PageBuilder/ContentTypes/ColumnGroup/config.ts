import { getStyleAsObject } from '../../lib/getStyleAsObject'

import component from '.'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { pbStyle } = elem.dataset

    return {
        'data-pb-style': pbStyle,
        style,
    }
}

export default { component, props }
