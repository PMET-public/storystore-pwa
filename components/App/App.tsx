import React, { FunctionComponent } from 'react'
import { useApp } from './useApp'

import Link from '../Link'
import AppTemplate from '@pmet-public/luma-ui/dist/components/App'
import DocumentMetadata from '../DocumentMetadata'
import Error from '../../components/Error'
import PageBuilder from '../../components/PageBuilder'

type AppProps = {}

export const App: FunctionComponent<AppProps> = ({ children }) => {
    const { loading, error, data, api } = useApp()

    if (error)
        return (
            <Error type="500" button={{ text: 'Reload App', onClick: () => location.reload() }} fullScreen>
                There was an issue loading the app.
            </Error>
        )

    if (!data && loading) return null

    if (!data)
        return (
            <Error type="500" button={{ text: 'Reload App', onClick: location.reload }} fullScreen>
                No data available.
            </Error>
        )

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
                    title: store.logoAlt || 'Luma',
                }}
                home={{
                    active: api.isUrlActive('/'),
                    as: Link,
                    href: '/',
                    text: 'Home',
                }}
                menu={categories.children.map(({ id, text, href }: any) => ({
                    active: api.isUrlActive('/' + href),
                    as: Link,
                    urlResolver: {
                        type: 'CATEGORY',
                        id,
                    },
                    href: '/' + href,
                    text,
                }))}
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
                        children: <PageBuilder html={footer.html} />,
                    }
                }
            >
                {children}
            </AppTemplate>
        </React.Fragment>
    )
}
