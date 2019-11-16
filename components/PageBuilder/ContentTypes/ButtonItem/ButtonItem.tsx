import React from 'react'
import { Component } from 'luma-ui/dist/lib'
import { Root, ButtonLink } from './ButtonItem.styled'

import ButtonComponent, { ButtonProps as ButtonComponentProps } from 'luma-ui/dist/components/Button'
import Link, { LinkProps } from '../../../Link'

export type ButtonItemProps = {
    button: ButtonComponentProps
    link: LinkProps
    type: 'button' | 'link'
    color: 'primary' | 'secondary'
}

export const ButtonItem: Component<ButtonItemProps> = ({ link, type, button, color, children, ...props }) => {
    return (
        <Root $color={color} as={link ? Link : 'span'} {...link} {...props}>
            {type === 'button' ? <ButtonComponent as="span" {...button} /> : <ButtonLink>{button.text}</ButtonLink>}
        </Root>
    )
}
