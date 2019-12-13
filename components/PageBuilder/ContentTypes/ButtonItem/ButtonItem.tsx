import React from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import { Root } from './ButtonItem.styled'

import ButtonComponent, { ButtonProps as ButtonComponentProps } from '@pmet-public/luma-ui/dist/components/Button'
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
            <ButtonComponent as="span" secondary={color === 'secondary'}>
                {button.text}
            </ButtonComponent>
        </Root>
    )
}
