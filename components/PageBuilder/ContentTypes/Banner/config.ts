import dynamic from 'next/dynamic'
import { LinkProps } from '../../../../components/Link'
import { resolveLink, LinkType } from './../../../../lib/resolveLink'
import { getBackgroundImages } from '../../lib/utils'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const { appearance, showButton, showOverlay } = elem.dataset

    const style = getStyleAsObject(elem.style)

    const linkElem = elem.querySelector('a[data-element="link"]')
    const linkType = linkElem?.getAttribute('data-link-type') as LinkType
    const linkHref = linkElem?.getAttribute('href')
    const linkTarget = linkElem?.getAttribute('target')

    const loadEagerly = elem.classList.contains('load-eagerly')

    /** Get Button */
    const link: LinkProps | undefined =
        linkElem?.nodeName === 'A' && linkHref
            ? {
                  ...resolveLink(linkHref, linkType),
                  target: linkTarget,
              }
            : undefined

    /** Get Bakground Image */
    const wrapperElem = elem.querySelector('[data-element="wrapper"]') as HTMLElement

    const { backgroundImages } = wrapperElem.dataset

    const background: ContentWithBackgroundProps = {
        ...wrapperElem.dataset,
        loadEagerly,
        backgroundImages: backgroundImages ? getBackgroundImages(backgroundImages) : undefined,
        video:
            wrapperElem.dataset.backgroundType === 'video'
                ? {
                      src: wrapperElem.dataset.videoSrc,
                      fallbackSrc: wrapperElem.dataset.videoFallbackSrc,
                      loop: wrapperElem.dataset.videoLoop === 'true',
                      playOnlyVisible: wrapperElem.dataset.videoPlayOnlyVisible === 'true',
                      lazyLoading: wrapperElem.dataset.videoLazyLoad === 'true',
                  }
                : undefined,
        style: getStyleAsObject(wrapperElem.style),
    }

    /** Get Button */
    const buttonElem = elem.querySelector('[data-element="button"]') as HTMLElement
    const button = buttonElem && {
        secondary: buttonElem.classList.contains('pagebuilder-button-secondary') ? true : false,
        text: buttonElem.textContent || '',
        style: getStyleAsObject(buttonElem.style),
        outline: buttonElem.classList.contains('pagebuilder-button-link') ? true : false,
    }

    /** Get Content */
    const contentElem = elem.querySelector('[data-element="content"]') as HTMLElement
    const content = contentElem && {
        ...contentElem.dataset,
        html: contentElem.innerHTML,
        style: getStyleAsObject(contentElem.style),
    }

    /** Get Overlay */
    const videoOverlayElement = elem.querySelector('[data-element="video_overlay"]') as HTMLElement
    const overlayElem = elem.querySelector('[data-element="overlay"]') as HTMLElement

    const overlay = overlayElem && {
        ...overlayElem.dataset,
        style: getStyleAsObject(overlayElem.style),
    }

    if (videoOverlayElement?.dataset.videoOverlayColor) {
        overlay.style.backgroundColor = videoOverlayElement.dataset.videoOverlayColor
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
