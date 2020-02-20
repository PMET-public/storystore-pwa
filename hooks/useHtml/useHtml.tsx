import React, { useMemo } from 'react'
import parseHtml, { domToReact, HTMLReactParserOptions } from 'html-react-parser'

import Link from '../../components/Link'

const options: HTMLReactParserOptions = {
    replace: ({ name, attribs, children }) => {
        if (name === 'a') {
            const style = attribs?.style?.split(';').reduce((obj: { [key: string]: string }, x: string) => {
                const [key, value] = x.split(':')
                return key ? { [key]: value.trim(), ...obj } : obj
            }, {})

            return (
                <Link {...attribs} style={style} urlResolver>
                    {children && domToReact(children, options)}
                </Link>
            )
        }
    },
}

export const useHtml = (html?: string) => useMemo(() => html && parseHtml(html, options), [html])
