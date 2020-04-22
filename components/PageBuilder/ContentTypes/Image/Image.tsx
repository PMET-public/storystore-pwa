import React, { useRef } from 'react'
import { Component } from '@pmet-public/luma-ui/lib'
import { Root, Caption } from './Image.styled'

import Link, { LinkProps } from '../../../Link'
import { useImage } from '@pmet-public/luma-ui/hooks/useImage'

export type ImageProps = {
    image: {
        src: {
            mobile?: string
            desktop: string
        }
        alt?: string
        title?: string
        style?: { [property: string]: string }
    }
    caption?: string
    link?: LinkProps
}

export const Image: Component<ImageProps> = ({ children, caption, link, image, ...props }) => {
    const ImageElem = useRef(null)

    const { src: _src, ...imageProps } = image
    const { src } = useImage(ImageElem, _src, { lazyload: { offsetY: 100 } })

    return (
        <Root as={link ? (p: any) => <Link {...link} {...p} /> : 'div'} {...props}>
            <figure>
                <img alt="" ref={ImageElem} src={src} {...imageProps} />
                {caption && <Caption as="figcaption">{caption}</Caption>}
            </figure>
        </Root>
    )
}
