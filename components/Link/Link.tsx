import React, { FunctionComponent, forwardRef } from 'react'
import { Props } from '@storystore/ui/dist/lib'
import styled from 'styled-components'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { CONTENT_TYPE } from '~/pages/_url-resolver'

export type LinkProps = Props<
    {
        href: string
        external?: boolean
        urlResolver?: {
            type: CONTENT_TYPE
            id: number | string
            [key: string]: any
        }
    } & NextLinkProps
>

const LinkElement = styled.a``

const Link: FunctionComponent<LinkProps> = forwardRef(
    (
        {
            href: _href,
            external,
            urlResolver,

            // Next Link Props
            as,
            replace,
            scroll,
            shallow,
            passHref,
            prefetch,
            linkTagAs,
            ...props
        },
        ref: any
    ) => {
        const href = _href.toString()

        const query =
            typeof urlResolver === 'object'
                ? Object.entries(urlResolver)
                      .filter(x => Boolean(x[1]))
                      .map(([key, value]) => `${key}=${value}`)
                      .join('&')
                : ''

        const linkProps: NextLinkProps = {
            href: external === false || urlResolver ? `/_url-resolver?${query}` : href,
            as: external === false || urlResolver ? href : as,
            replace,
            scroll,
            shallow,
            passHref,
            prefetch,
        }

        return external ? (
            <LinkElement href={href} {...props} />
        ) : (
            <NextLink {...linkProps}>
                <LinkElement as={linkTagAs} ref={ref} href={href} {...props} />
            </NextLink>
        )
    }
)

Link.displayName = 'Link'

export { Link }
