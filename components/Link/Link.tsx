import NextLink, { LinkProps } from 'next/link'
import { FunctionComponent } from 'react'

export const Link: FunctionComponent<LinkProps> = ({
    href,
    as,
    replace,
    scroll,
    shallow,
    passHref,
    prefetch,
    ...props
}) => (
        <NextLink 
            {...{
                href: `/_url-resolver?url=${href}`,
                as: href,
                replace,
                scroll,
                shallow,
                passHref,
                prefetch,
            }}
        >
            <a {...props} />
        </NextLink>
    )
