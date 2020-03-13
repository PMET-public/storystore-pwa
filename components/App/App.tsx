import React, { FunctionComponent } from 'react'
import { ServerError } from 'apollo-link-http-common'
import dynamic from 'next/dynamic'

import { useApp } from './useApp'
import { useIsUrlActive } from '../../lib/resolveLink'
import useNetworkStatus from '../../hooks/useNetworkStatus'

import Link from '../Link'
import AppTemplate from '@pmet-public/luma-ui/dist/components/App'
import PageBuilder from '../../components/PageBuilder'

import Head from '../Head'

const Error = dynamic(() => import('../../components/Error'))

type AppProps = {
    categoriesParentId: string
    footerBlockId: string
}

export const App: FunctionComponent<AppProps> = ({ children, categoriesParentId, footerBlockId }) => {
    const { loading, error, data, footer } = useApp({ categoriesParentId, footerBlockId })
    const isUrlActive = useIsUrlActive()
    const online = useNetworkStatus()

    if (online && error) {
        const networkError = error.networkError as ServerError

        if (networkError) {
            if (networkError?.statusCode === 401 || networkError?.statusCode === 403) {
                return (
                    <Error
                        type="401"
                        button={{ text: 'Login', onClick: () => (window.location.href = '/basic-auth') }}
                        fullScreen
                    >
                        Authorization Required
                    </Error>
                )
            }
        }
    }

    if (!loading && !data) {
        return (
            <Error type="500" button={{ text: 'Reload App', onClick: () => window.location.reload() }} fullScreen>
                No data available.
            </Error>
        )
    }

    const { store, categories = [], cart } = data

    return (
        <React.Fragment>
            {store && (
                <Head
                    defaults={{
                        title: store.metaTitle,
                        titlePrefix: store.metaTitlePrefix,
                        titleSuffix: store.metaTitleSuffix,
                        description: store.metaDescription,
                        keywords: store.metaKeywords,
                    }}
                />
            )}

            <AppTemplate
                loading={loading && !store}
                logo={{
                    as: Link,
                    href: '/',
                    title: store?.logoAlt || 'Luma',
                }}
                home={{
                    active: isUrlActive('/'),
                    as: Link,
                    href: '/',
                    text: 'Home',
                }}
                menu={categories[0]?.children.map(({ id, text, href }: any) => ({
                    active: isUrlActive('/' + href),
                    as: Link,
                    urlResolver: {
                        type: 'CATEGORY',
                        id,
                    },
                    href: '/' + href,
                    text,
                }))}
                search={{
                    active: isUrlActive('/search'),
                    as: Link,
                    href: '/search',
                    text: 'Search',
                }}
                cart={{
                    active: isUrlActive('/cart'),
                    as: Link,
                    href: '/cart',
                    text: 'Bag',
                    icon: {
                        count: cart?.totalQuantity || 0,
                    },
                }}
                footer={{
                    loading: footer.loading,
                    html: footer.data?.footer && <PageBuilder html={footer.data.footer.items[0].html} />,
                }}
            >
                {children}
            </AppTemplate>
        </React.Fragment>
    )
}
