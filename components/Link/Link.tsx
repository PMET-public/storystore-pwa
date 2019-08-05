import NextLink, { LinkProps as _LinkProps } from 'next/link'
import { FunctionComponent } from 'react'
import { useRouter } from 'next/router'
import { Props, classes } from 'luma-storybook/dist/lib'

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
    const { query: { url: _url } } = useRouter()
    const href = pathname(_href.toString())
    const url = pathname(_url.toString())

    return (
        <NextLink
            {...{
                href: `/_url-resolver?url=${href}`,
                as: _href,
                replace,
                scroll,
                shallow,
                passHref,
                prefetch,
            }}
        >
            <a {...props} className={classes(props.className || '', ['--active', url === href])} />
        </NextLink>
    )

}
