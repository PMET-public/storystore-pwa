import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

import { LinkProps } from '../../../../components/Link'
import { ImageProps } from '@pmet-public/luma-ui/components/Image'
import { LinkType, resolveLink } from '../../../../lib/resolveLink'
import { resolveImage } from '../../../../lib/resolveImage'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const linkElem = elem.children[0]

    const imageElement =
        linkElem.nodeName === 'A'
            ? (linkElem.children as HTMLCollectionOf<HTMLElement>)
            : (elem.children as HTMLCollectionOf<HTMLElement>)

    const desktopSrc = imageElement[0].getAttribute('src') || ''
    const mobileSrc = imageElement[1].getAttribute('src') || ''

    const image: ImageProps & { style: {} } = {
        src: {
            desktop: resolveImage(desktopSrc),
            mobile: mobileSrc !== desktopSrc ? resolveImage(mobileSrc) : undefined,
        },
        alt: imageElement[0].getAttribute('alt') || undefined,
        title: imageElement[0].getAttribute('title') || undefined,
        style: getStyleAsObject(imageElement[0].style),
    }

    const linkType = linkElem.getAttribute('data-link-type') as LinkType
    const linkHref = linkElem.getAttribute('href')
    const linkTarget = linkElem.getAttribute('target')

    const link: LinkProps | undefined =
        linkElem?.nodeName === 'A' && linkHref
            ? {
                  ...resolveLink(linkHref, linkType),
                  target: linkTarget,
              }
            : undefined

    const captionElement = elem.querySelector('figcaption')
    const caption = captionElement ? captionElement.textContent : undefined

    return {
        image,
        caption,
        link,
        style,
    }
}

export default { component, props }
