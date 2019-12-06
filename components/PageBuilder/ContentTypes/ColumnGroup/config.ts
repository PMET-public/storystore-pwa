import { getStyleAsObject } from '../../lib/getStyleAsObject'

import component from '.'

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    return { style }
}

export default { component, props }
