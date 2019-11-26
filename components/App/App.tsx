import React, { FunctionComponent } from 'react'
import { useApp } from './useApp'
import Head from 'next/head'
import Link from '../Link'
import AppTemplate from '@pmet-public/luma-ui/dist/components/App'
import DocumentMetadata from '../DocumentMetadata'
import Error from '../../components/Error'
import PageBuilder from '../../components/PageBuilder'

type AppProps = {}

export const App: FunctionComponent<AppProps> = ({ children }) => {
    const { loading, error, data, api } = useApp()
    if (error) {
        if (error.networkError && (error.networkError as any).statusCode === 401) {
            return (
                <Error type="401" button={{ text: 'Try Again', onClick: () => location.reload() }} fullScreen>
                    Authorization Required
                </Error>
            )
        } else {
            return (
                <Error type="500" button={{ text: 'Reload App', onClick: () => location.reload() }} fullScreen>
                    {error.message}
                </Error>
            )
        }
    }

    if (!(data && data.store) && loading) return null

    if (!data)
        return (
            <Error type="500" button={{ text: 'Reload App', onClick: location.reload }} fullScreen>
                No data available.
            </Error>
        )

    const { store, categories, cart, footer } = data

    return (
        <React.Fragment>
            <Head>
                <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
                <meta name="theme-color" content="#222222" />
                <link rel="shortcut icon" href="/static/favicon.ico" type="image/x-icon" />

                {/* iOS */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Luma" />
                <link rel="apple-touch-startup-image" />
                <link
                    rel="apple-touch-icon"
                    href={`${location.origin}/static/ios-icon.png`}
                    crossOrigin="use-credentials"
                />

                {/* Web App Manifest  */}
                <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />

                {/* Fonts */}
                <link rel="stylesheet" href="/static/fonts.css" />
            </Head>

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
