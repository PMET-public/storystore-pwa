import React, { FunctionComponent } from 'react'
import { useApp } from './useApp'
import dynamic from 'next/dynamic'

import Link from '../Link'
import AppTemplate from '@pmet-public/luma-ui/dist/components/App'
import DocumentMetadata from '../DocumentMetadata'
import PageBuilder from '../../components/PageBuilder'
import { useIsUrlActive } from '../../lib/resolveLink'

const Error = dynamic(() => import('../../components/Error'))

type AppProps = {}

export const App: FunctionComponent<AppProps> = ({ children }) => {
    const { loading, error, data } = useApp()
    const isUrlActive = useIsUrlActive()

    if (error) {
        if ((error?.networkError as any).statusCode === 401) {
            return (
                <Error type="401" button={{ text: 'Try Again', onClick: () => location.reload() }} fullScreen>
                    Authorization Required
                </Error>
            )
        } else if ((error?.networkError as any).statusCode === 403) {
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

    if (!loading && !data) {
        return (
            <Error type="500" button={{ text: 'Reload App', onClick: location.reload }} fullScreen>
                No data available.
            </Error>
        )
    }

    const { store, categories, cart, footer } = data

    return (
        <React.Fragment>
            {store && (
                <DocumentMetadata
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
                menu={categories?.children?.map(({ id, text, href }: any) => ({
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
                        count: cart ? cart.totalQuantity : 0,
                    },
                }}
                footer={{
                    html: footer && <PageBuilder html={footer.html} />,
                }}
            >
                {children}
            </AppTemplate>
        </React.Fragment>
    )
}
