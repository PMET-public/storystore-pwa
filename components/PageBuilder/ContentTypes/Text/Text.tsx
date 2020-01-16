import React, { useMemo } from 'react'
import parseHtml, { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import { Root } from './Text.styled'
import Link from '../../../Link'

export type TextProps = {}

const options: HTMLReactParserOptions = {
    replace: ({ name, attribs, children }) => {
        if (name === 'a') {
            const style = attribs?.style?.split(';').reduce((obj, x) => {
                const [key, value] = x.split(':')
                return key ? { [key]: value.trim(), ...obj } : obj
            }, {})

            return (
                <Link {...attribs} style={style}>
                    {children && domToReact(children, options)}
                </Link>
            )
        }
    },
}

export const Text: Component<TextProps> = ({ children, innerHTML, ...props }) => {
    const html = useMemo(() => parseHtml(innerHTML, options), [innerHTML])

    return <Root {...props}>{html}</Root>
}
