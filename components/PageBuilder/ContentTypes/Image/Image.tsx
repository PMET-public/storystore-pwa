import React from 'react'
import { Component } from '@pmet-public/luma-ui/lib'
import { Root, Caption } from './Image.styled'

import Link, { LinkProps } from '~/components/Link'
import ImageComponent, { ImageProps as ImageComponentProps } from '@pmet-public/luma-ui/components/Image'

export type ImageProps = {
    image: ImageComponentProps
    caption?: string
    link?: LinkProps
}

export const Image: Component<ImageProps> = ({ children, caption, link, image, ...props }) => {
    return (
        <Root as={link ? (p: any) => <Link {...link} {...p} /> : 'div'} {...props}>
            <figure>
                <ImageComponent {...image} />
                {caption && <Caption as="figcaption">{caption}</Caption>}
            </figure>
        </Root>
    )
}
