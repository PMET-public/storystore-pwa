import React, { FunctionComponent, forwardRef } from 'react'
import { Props } from '@pmet-public/luma-ui/dist/lib'
import styled from 'styled-components'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'

export type LinkProps = Props<
    {
        href: string
        external?: boolean
        urlResolver?: {
            type: 'CMS_BLOCK' | 'PAGE' | 'PRODUCT'
            id: number
        }
    } & NextLinkProps
>

const LinkElement = styled.a``

export const Link: FunctionComponent<LinkProps> = forwardRef(
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

        const query = typeof urlResolver === 'object' ? `type=${urlResolver.type}&contentId=${urlResolver.id}` : ''

        const linkProps: NextLinkProps = {
            href: external === false || urlResolver ? `/_url-resolver?url=${href}&${query}` : href,
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
