import React, { FunctionComponent } from 'react'
import NextLink, { LinkProps as _LinkProps } from 'next/link'
import styled from 'styled-components'
import { Props } from 'luma-ui/dist/lib'

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

export const Link: FunctionComponent<LinkProps> = ({
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
}) => {
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
            <ATag as={linkTagAs} href={_href as string} {...props} />
        </NextLink>
    )
}
