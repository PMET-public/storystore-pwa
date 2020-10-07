import React from 'react'
import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'

import { LinkProps } from '../../../Link'
import { ImageProps } from '@storystore/ui/dist/components/Image'
import { LinkType, resolveLink } from '../../../../lib/resolveLink'
import { resolveImage } from '../../../../lib/resolveImage'

const component = dynamic(() => import('.'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const linkElem = elem.children[0]

    const imageElement = linkElem.nodeName === 'A' ? (linkElem.children as HTMLCollectionOf<HTMLElement>) : (elem.children as HTMLCollectionOf<HTMLElement>)

    const desktopSrc = imageElement[0].getAttribute('src') || ''
    const mobileSrc = imageElement[1].getAttribute('src') || ''

    const image: ImageProps & { style: any } = {
        src: resolveImage(desktopSrc),
        sources: [
            <source key="desktop-webp" type="image/webp" media="(min-width: 600px)" srcSet={resolveImage(desktopSrc, { type: 'webp' })} />,
            <source key="desktop" media="(min-width: 600px)" srcSet={resolveImage(desktopSrc)} />,
        ],
        alt: imageElement[0].getAttribute('alt') || imageElement[0].getAttribute('title') || undefined,
        style: getStyleAsObject(imageElement[0].style),
    }

    if (mobileSrc) {
        image.src = resolveImage(mobileSrc)
        image.sources = [
            <source key="mobile-webp" type="image/webp" media="(max-width: 599px)" srcSet={resolveImage(mobileSrc, { type: 'webp' })} />,
            <source key="mobile" media="(max-width: 599px)" srcSet={resolveImage(mobileSrc)} />,
            ...(image.sources as JSX.Element[]),
        ]
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
