import React, { FunctionComponent } from 'react'
import { ServerError } from 'apollo-link-http-common'
import dynamic from 'next/dynamic'

import { useApp } from './useApp'
import { resolveImage } from '../../lib/resolveImage'
import { useIsUrlActive } from '../../lib/resolveLink'
import useNetworkStatus from '../../hooks/useNetworkStatus'

import FontStyles from './FontStyles'
import AppTemplate from '@pmet-public/luma-ui/dist/components/App'
import PageBuilder from '../../components/PageBuilder'
import Head from '../../components/Head'
import Link from '../../components/Link'

const Error = dynamic(() => import('../../components/Error'))

type AppProps = {
    footerBlockId: string
}

export const App: FunctionComponent<AppProps> = ({ children, footerBlockId }) => {
    const { queries } = useApp({ footerBlockId })

    const isUrlActive = useIsUrlActive()

    const online = useNetworkStatus()

    if (online && queries.app.error) {
        const networkError = queries.app.error?.networkError as ServerError

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

    if (!queries.app.loading && !queries.app.data) {
        return (
            <Error type="500" button={{ text: 'Reload App', onClick: () => window.location.reload() }} fullScreen>
                No data available.
            </Error>
        )
    }

    const { store, cart, categories = [], footer } = queries.app.data || {}

    const categoryUrlSuffix = store?.categoryUrlSuffix ?? ''

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
                loading={queries.app.loading && !store}
                logo={{
                    as: Link,
                    svg: store?.logoSrc
                        ? () => (
                              <img
                                  src={resolveImage(store.baseMediaUrl + 'logo/' + store.logoSrc)}
                                  alt={store?.logoAlt || 'PWA Story Store'}
                              />
                          )
                        : undefined,
                    href: '/',
                    title: store?.logoAlt || 'PWA Story Store',
                }}
                home={{
                    active: isUrlActive('/'),
                    as: Link,
                    href: '/',
                    text: 'Home',
                }}
                menu={categories[0]?.children.map(({ id, text, href: _href }: any) => {
                    const href = _href + categoryUrlSuffix

                    return {
                        active: isUrlActive('/' + href),
                        as: Link,
                        urlResolver: {
                            type: 'CATEGORY',
                            id,
                        },
                        href: '/' + href,
                        text,
                    }
                })}
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
                    loading: queries.app.loading,
                    html: footer?.items[0]?.html ? (
                        <PageBuilder html={footer.items[0].html} />
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.4rem', opacity: '0.7' }}>
                            {store?.copyright}
                        </div>
                    ),
                }}
            >
                {children}
            </AppTemplate>
            <FontStyles />
        </React.Fragment>
    )
}
