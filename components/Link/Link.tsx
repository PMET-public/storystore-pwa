import React, { FunctionComponent } from 'react'
import NextLink, { LinkProps as _LinkProps } from 'next/link'
import { Props } from 'luma-storybook/dist/lib'

export type LinkProps = Props<_LinkProps>

const pathname = (pathname: string) => pathname.replace(/^(\/)/, '')

export const Link: FunctionComponent<LinkProps> = ({
    href: _href,
    as,
    replace,
    scroll,
    shallow,
    passHref,
    prefetch,
    ...props
}) => {
    const href = pathname(_href.toString())

    const linkProps = {
        href: `/_url-resolver?url=${href}`,
        as: _href,
        replace,
        scroll,
        shallow,
        passHref,
        prefetch,
    }

    return (
        <NextLink {...linkProps}>
            <a {...props} />
        </NextLink>
    )
}
