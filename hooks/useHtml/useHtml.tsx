import React, { useMemo } from 'react'
import parseHtml, { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { resolveLink, LinkType } from '~/lib/resolveLink'
import { resolveImage } from '~/lib/resolveImage'

import Link from '~/components/Link'
import Image from '@storystore/ui/dist/components/Image'

const styleToObj = (style: string) =>
    style.split(';').reduce((obj: { [key: string]: string }, x: string) => {
        const [key, value] = x.split(':')
        return key ? { [key]: value.trim(), ...obj } : obj
    }, {})

const options: HTMLReactParserOptions = {
    replace: ({ name, attribs, children }) => {
        if (name === 'a' && attribs?.href) {
            const linkHref = attribs.href
            const linkType = attribs['data-link-type'] as LinkType

            if (attribs?.style) {
                attribs.style = styleToObj(attribs.style)
            }

            return (
                <Link {...resolveLink(linkHref, linkType)} {...attribs}>
                    {children && domToReact(children, options)}
                </Link>
            )
        }

        if (name === 'img' && attribs?.src) {
            if (attribs?.style) {
                attribs.style = styleToObj(attribs.style)
            }

            return (
                <Image
                    {...attribs}
                    src={resolveImage(attribs.src)}
                    sources={[<source key="webp" type="image/webp" srcSet={resolveImage(attribs.src, { type: 'webp' })} />, <source key="original" srcSet={resolveImage(attribs.src)} />]}
                />
            )
        }
    },
}

export const useHtml = (html?: string) => useMemo(() => html && parseHtml(html, options), [html])
