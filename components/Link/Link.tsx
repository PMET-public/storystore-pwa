import React, { FunctionComponent, forwardRef } from 'react'
import NextLink, { LinkProps as _LinkProps } from 'next/link'
import styled from 'styled-components'
import { Props } from '@pmet-public/luma-ui/dist/lib'

export type LinkProps = Props<{
    urlResolver?:
        | {
              type: 'CMS_BLOCK' | 'PAGE' | 'PRODUCT'
              id: number
          }
        | boolean
    linkTagAs?: 'a' | 'button'
}>

const ATag = styled.a``
// const pathname = (pathname: string) => pathname // .replace(/^(\/)/, '')

export const Link: FunctionComponent<LinkProps> = forwardRef(
    (
        {
            href: _href,
            as,
            replace,
            scroll,
            shallow,
            passHref,
            prefetch,
            urlResolver = false,
            linkTagAs = 'a',
            ...props
        },
        ref: any
    ) => {
        const href = _href.toString()

        const query = typeof urlResolver === 'object' ? `type=${urlResolver.type}&contentId=${urlResolver.id}` : ''

        const linkProps = {
            href: urlResolver ? `/_url-resolver?url=${href}&${query}` : _href,
            as: urlResolver ? _href : as,
            replace,
            scroll,
            shallow,
            passHref,
            prefetch,
        }

        return (
            <NextLink {...linkProps}>
                <ATag ref={ref} as={linkTagAs as any} href={_href as string} {...props} />
            </NextLink>
        )
    }
)
