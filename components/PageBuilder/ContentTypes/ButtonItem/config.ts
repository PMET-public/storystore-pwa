import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { resolveLink } from './../../../../lib/resolveLink'
import { LinkProps } from '../../../../components/Link'
import { ButtonProps } from '@pmet-public/luma-ui/dist/components/Button'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const buttonElem = elem.childNodes[0] as HTMLElement

    const type = buttonElem.classList.contains('pagebuilder-button-link') ? 'link' : 'button'

    const color = buttonElem.classList.contains('pagebuilder-button-secondary') ? 'secondary' : 'primary'

    const style = getStyleAsObject(elem.style)

    const button: ButtonProps = {
        text: elem.textContent || '',
    }

    const href = buttonElem.getAttribute('href')

    const link: LinkProps | undefined =
        buttonElem.nodeName === 'A' && href
            ? {
                  href: resolveLink(buttonElem.getAttribute('href') || ''),
                  urlResolver: true,
                  target: buttonElem.getAttribute('target') || undefined,
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
