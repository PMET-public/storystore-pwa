import dynamic from 'next/dynamic'
import { LinkProps } from '../../../../components/Link'
import { resolveLink } from './../../../../lib/resolveLink'
import { getBackgroundImages } from '../../lib/utils'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const { appearance, showButton, showOverlay } = elem.dataset

    const style = getStyleAsObject(elem.style)

    /** Get Button */
    const link: LinkProps | undefined =
        elem.childNodes[0].nodeName === 'A'
            ? {
                  href: resolveLink(elem.children[0].getAttribute('href') || ''),
                  urlResolver: true,
                  //   type:  elem.children[0].getAttribute('data-link-type') || undefined,
                  target: elem.children[0].getAttribute('href') || undefined,
              }
            : undefined

    /** Get Bakground Image */
    const wrapperElem = elem.querySelector('[data-element="wrapper"]') as HTMLElement

    const { backgroundImages } = wrapperElem.dataset

    const background: ContentWithBackgroundProps = {
        ...wrapperElem.dataset,
        backgroundImages: backgroundImages ? getBackgroundImages(backgroundImages) : undefined,
        style: getStyleAsObject(wrapperElem.style),
    }

    /** Get Button */
    const buttonElem = elem.querySelector('[data-element="button"]') as HTMLElement
    const button = buttonElem && {
        secondary: buttonElem.classList.contains('pagebuilder-button-secondary') ? true : false,
        text: buttonElem.textContent || '',
        style: getStyleAsObject(buttonElem.style),
        // type: buttonElem.getAttribute('data-link-type') || undefined,
    }

    /** Get Content */
    const contentElem = elem.querySelector('[data-element="content"]') as HTMLElement
    const content = contentElem && {
        ...contentElem.dataset,
        html: contentElem.innerHTML,
        style: getStyleAsObject(contentElem.style),
    }

    /** Get Overlay */
    const overlayElem = elem.querySelector('[data-element="overlay"]') as HTMLElement
    const overlay = overlayElem && {
        ...overlayElem.dataset,
        style: getStyleAsObject(overlayElem.style),
    }

    return {
        appearance,
        background,
        button,
        content,
        link,
        overlay,
        showButton,
        showOverlay,
        style,
    }
}

export default { component, props }
