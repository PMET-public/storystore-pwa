import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { resolveLink, LinkType } from './../../../../lib/resolveLink'
import { LinkProps } from '../../../../components/Link'
import { ButtonProps } from '@pmet-public/luma-ui/components/Button'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const buttonElem = elem.childNodes[0] as HTMLElement

    const type = buttonElem.classList.contains('pagebuilder-button-link') ? 'link' : 'button'

    const color = buttonElem.classList.contains('pagebuilder-button-secondary') ? 'secondary' : 'primary'

    const style = getStyleAsObject(elem.style)

    const button: ButtonProps = {
        text: elem.textContent || '',
    }

    const linkType = buttonElem.getAttribute('data-link-type') as LinkType
    const linkHref = buttonElem.getAttribute('href')
    const linkTarget = buttonElem.getAttribute('target')

    const link: LinkProps | undefined =
        buttonElem.nodeName === 'A' && linkHref
            ? {
                  ...resolveLink(linkHref, linkType),
                  target: linkTarget,
              }
            : undefined

    return {
        button,
        link,
        style,
        type,
        color,
    }
}

export default { component, props }
