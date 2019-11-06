import React, { FunctionComponent } from 'react'
import { useApp } from './useApp'

import Link from '../Link'
import AppTemplate from 'luma-ui/dist/components/App'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'

type AppProps = {
    categoryId: number
    footerId?: string
}

export const App: FunctionComponent<AppProps> = ({ categoryId, footerId, children }) => {
    const { loading, error, data, api } = useApp({ categoryId, footerId })

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

    const { store, categories, cart, footer } = data

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
                    href: '/',
                    title: store.logoAlt,
                }}
                home={{
                    active: api.isUrlActive('/'),
                    as: Link,
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
                footer={
                    footer && {
                        pageBuilder: {
                            html: footer.html,
                        },
                    }
                }
            >
                {children}
            </AppTemplate>
        </React.Fragment>
    )
}
