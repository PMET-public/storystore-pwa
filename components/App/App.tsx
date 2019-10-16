import React, { FunctionComponent } from 'react'
import { useApp } from './useApp'

import Link from '../Link'
import AppTemplate from 'luma-ui/dist/components/App'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'

type AppProps = {
    categoryId: number
}

export const App: FunctionComponent<AppProps> = ({ categoryId, children }) => {
    const { loading, error, data, api } = useApp({ categoryId })

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    if (!data) {
        return <Error statusCode={500} />
    }

    const { store, categories, cart } = data

    return (
        <React.Fragment>
            <DocumentMetadata
                defaults={{
                    title: store.metaTitle,
                    titlePrefix: store.metaTitlePrefix,
                    titleSuffix: store.metaTitleSuffix,
                    description: store.metaDescription,
                    keywords: store.metaKeywords,
                }}
            />
            <AppTemplate
                logo={{
                    as: Link,
                    urlResolver: true,
                    href: '/',
                    title: store.logoAlt,
                }}
                home={{
                    active: api.isUrlActive('/'),
                    as: Link,
                    urlResolver: true,
                    href: '/',
                    text: 'Home',
                }}
                menu={categories.children.map(({ text, href }: any) => ({
                    active: api.isUrlActive('/' + href),
                    as: Link,
                    urlResolver: true,
                    href: '/' + href,
                    text,
                }))}
                myAccount={{
                    // active: api.isUrlActive('/account'),
                    // as: Link,
                    // href: '/account',
                    text: 'My Account',
                }}
                favorites={{
                    // active: api.isUrlActive('/account'),
                    // as: Link,
                    // href: '/account',
                    text: 'Likes',
                }}
                search={{
                    active: api.isUrlActive('/search'),
                    as: Link,
                    href: '/search',
                    text: 'Search',
                }}
                cart={{
                    active: api.isUrlActive('/cart'),
                    as: Link,
                    href: '/cart',
                    text: 'Bag',
                    icon: {
                        count: cart ? cart.totalQuantity : 0,
                    },
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
