import React, { FunctionComponent, useCallback } from 'react'
import { useRouter } from 'next/router'
import useApp from '../../api/useApp'
import useCart from '../../api/useCart'

import Link from '../Link'
import AppTemplate from 'luma-ui/dist/components/App'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'

export const App: FunctionComponent = ({ children }) => {
    const { query } = useApp({ categoryId: 2 })

    const { state: cartState } = useCart()

    const { route, query: urlQuery } = useRouter()

    const isUrlActive = useCallback(
        (href: string) => {
            return href === (urlQuery.url || route)
        },
        [urlQuery.url, route]
    )

    if (query.loading) {
        return <ViewLoader />
    }

    if (query.error) {
        console.error(query.error.message)
        return <Error statusCode={500} />
    }

    const { store, categories, meta } = query.data

    return (
        <React.Fragment>
            <DocumentMetadata {...meta} />
            <AppTemplate
                logo={{
                    as: Link,
                    urlResolver: true,
                    href: '/',
                    title: store.logoAlt,
                }}
                home={{
                    active: isUrlActive('/'),
                    as: Link,
                    urlResolver: true,
                    href: '/',
                    text: 'Home',
                }}
                menu={categories.children.map(({ text, href }: any) => ({
                    active: isUrlActive('/' + href),
                    as: Link,
                    urlResolver: true,
                    href: '/' + href,
                    text,
                }))}
                myAccount={{
                    // active: isUrlActive('/account'),
                    // as: Link,
                    // href: '/account',
                    text: 'My Account',
                }}
                favorites={{
                    // active: isUrlActive('/account'),
                    // as: Link,
                    // href: '/account',
                    text: 'Likes',
                }}
                search={{
                    active: isUrlActive('/search'),
                    as: Link,
                    href: '/search',
                    text: 'Search',
                }}
                cart={{
                    active: isUrlActive('/cart'),
                    as: Link,
                    icon: {
                        count: cartState.count,
                    },
                    href: '/cart',
                    text: 'Bag',
                }}
                footer={{
                    copyright: store.copyright,
                    menu: [
                        { text: 'About', as: Link, urlResolver: true, href: '/about-us' },
                        { text: 'Customer Service', as: Link, urlResolver: true, href: '/customer-service' },
                        {
                            text: 'Privacy Policy',
                            as: Link,
                            urlResolver: true,
                            href: '/privacy-policy-cookie-restriction-mode',
                        },
                    ],
                    social: {
                        facebook: { title: 'Facebook', as: 'a', href: 'https://facebook.com', target: 'blank' },
                        twitter: { title: 'Twitter', as: 'a', href: 'https://twitter.com', target: 'blank' },
                        pinterest: { title: 'Pinterest', as: 'a', href: 'https://pinterest.com', target: 'blank' },
                        instragram: { title: 'Instagram', as: 'a', href: 'https://instagram.com', target: 'blank' },
                    },
                }}
            >
                {children}
            </AppTemplate>
        </React.Fragment>
    )
}
