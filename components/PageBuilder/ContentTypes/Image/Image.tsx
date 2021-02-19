import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import { Root, Img, Caption } from './Image.styled'

import Link, { LinkProps } from '~/components/Link'
import { ImageProps as ImageComponentProps } from '@storystore/ui/dist/components/Image'

export type ImageProps = {
    image: ImageComponentProps
    caption?: string
    link?: LinkProps
}

export const Image: Component<ImageProps> = ({ caption, link, image, ...props }) => {
    return (
        <Root as={link ? (p: any) => <Link {...link} {...p} /> : 'div'} {...props}>
            <Img originalWidthAndHeight {...image} />
            {caption && <Caption as="figcaption">{caption}</Caption>}
        </Root>
    )
}
