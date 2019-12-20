import React, { useRef, useContext, useEffect } from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import { Root } from './ButtonItem.styled'

import ButtonComponent, { ButtonProps as ButtonComponentProps } from '@pmet-public/luma-ui/dist/components/Button'
import Link, { LinkProps } from '../../../Link'
import { ButtonsContext } from '../Buttons'

export type ButtonItemProps = {
    button: ButtonComponentProps
    link: LinkProps
    type: 'button' | 'link'
    color: 'primary' | 'secondary'
}

export const ButtonItem: Component<ButtonItemProps> = ({ link, type, button, color, children, ...props }) => {
    const { appearance, sameWidth, maxWidth, setMaxWidth } = useContext(ButtonsContext)

    const rootElem = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const width = rootElem.current?.offsetWidth || 0
        if (sameWidth && width > maxWidth) setMaxWidth(width)
    }, [rootElem.current])

    return (
        <Root
            ref={rootElem}
            as={link ? Link : 'span'}
            {...link}
            {...props}
            $appearance={appearance}
            $secondary={color === 'secondary'}
            $link={type === 'link'}
            $maxWidth={sameWidth ? maxWidth : undefined}
        >
            <ButtonComponent as="span">{button.text}</ButtonComponent>
        </Root>
    )
}
