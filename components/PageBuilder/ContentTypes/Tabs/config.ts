import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { appearance, activeTab } = elem.dataset

    const navigationEl = elem.childNodes[0]
    const tabItemsElems = navigationEl.childNodes
    const tabItems = Array.from(tabItemsElems, tabEl => tabEl.textContent)

    const alignmentMatch = /tab-align-([a-zA-Z]*)/.exec(elem.classList.toString())
    const tabsAlignment = alignmentMatch ? alignmentMatch[1] : null

    return { style, appearance, activeTab, tabItems, tabsAlignment }
}

export default { component, props }
