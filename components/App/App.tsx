import React, { FunctionComponent, useEffect, useCallback } from 'react'
import { ServerError } from 'apollo-link-http-common'
import dynamic from 'next/dynamic'
import { version } from '~/package.json'
import ReactGA from 'react-ga'
import Router from 'next/router'

import { Root, HeaderContainer, Main, FooterContainer, Copyright, TabBarContainer } from './App.styled'

import { useApp } from './useApp'
import { resolveImage } from '~/lib/resolveImage'
import { useIsUrlActive } from '~/lib/resolveLink'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'
import { useServiceWorker } from '~/hooks/useServiceWorker'
import useNetworkStatus from '~/hooks/useNetworkStatus'

import Head from '~/components/Head'
import Link from '~/components/Link'
import Header from '@pmet-public/luma-ui/components/Header'
import TabBar from '@pmet-public/luma-ui/components/TabBar'
import Footer from '@pmet-public/luma-ui/components/Footer'

import IconSearchSvg from 'remixicon/icons/System/search-line.svg'
import IconSearchActiveSvg from 'remixicon/icons/System/search-fill.svg'
import IconBagSvg from 'remixicon/icons/Finance/shopping-bag-line.svg'
import IconBagActiveSvg from 'remixicon/icons/Finance/shopping-bag-fill.svg'
import IconHomeSvg from 'remixicon/icons/Buildings/store-2-line.svg'
import IconHomeActiveSvg from 'remixicon/icons/Buildings/store-2-fill.svg'

const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'), { ssr: false })

type AppProps = {}

export const App: FunctionComponent<AppProps> = ({ children }) => {
    const workbox = useServiceWorker()

    const { cartId, settings, setCartId } = useStoryStore()

    const { queries, api } = useApp({ cartId, footerBlockId: settings.footerBlockId })

    const isUrlActive = useIsUrlActive()

    const online = useNetworkStatus()

    const isProduction = process.env.NODE_ENV === 'production'

    /**
     * No Cart no problem. Let's create one
     */
    useEffect(() => {
        if (queries.cart.loading || api.creatingCart.loading || !!api.creatingCart.data?.cartId) return

        if (queries.cart.error || !cartId) {
            if (process.env.NODE_ENV !== 'production') console.log('🛒 Creating new Cart')
            api.createCart(setCartId)
        }
    }, [queries, api, cartId])

    /**
     * Update SW Cache on Route change
     */
    const handleRouteChange = useCallback(
        (url, error?: any) => {
            if (error || !workbox) return

            workbox.messageSW({
                type: 'CACHE_URLS',
                payload: {
                    urlsToCache: [url],
                },
            })

            ReactGA.pageview(url)
        },
        [workbox]
    )

    useEffect(() => {
        Router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [handleRouteChange])

    useEffect(() => {
        if (isProduction) {
            /**
             * Google Analytics
             */
            ReactGA.initialize('UA-162672258-1')
        }
    }, [])

    /**
     * Google Analytics
     */
    useEffect(() => {
        if (!isProduction) return

        ReactGA.set({ dimension1: version }) // verion

        ReactGA.set({ dimension2: window.location.host }) // release

        if (settings.magentoUrl) {
            ReactGA.set({ dimension3: new URL(settings.magentoUrl).host }) // endpoint
        }

        ReactGA.pageview(window.location.pathname)
    }, [settings])

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

    const { store, categories = [] } = queries.app.data || {}

    const { cart } = queries.cart.data || {}

    const { footer } = queries.footer.data || {}

    const categoryUrlSuffix = store?.categoryUrlSuffix ?? ''

    const loading = queries.app.loading && !store

    return (
        <React.Fragment>
            {/* Head Metadata */}
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

            <Root>
                <HeaderContainer as="header" $margin>
                    <Header
                        loading={loading}
                        logo={{
                            as: Link,
                            image: store?.logoSrc && {
                                src: resolveImage(store.baseMediaUrl + 'logo/' + store.logoSrc),
                                alt: store?.logoAlt || 'PWA Story Store',
                            },
                            href: '/',
                            title: store?.logoAlt || 'PWA Story Store',
                        }}
                        menu={{
                            items: categories[0]?.children.map(({ id, text, href: _href }: any) => {
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
                            }),
                        }}
                        utilities={{
                            items: [
                                {
                                    active: isUrlActive('/search'),
                                    as: Link,
                                    className: 'breakpoint-smallOnly-hidden',
                                    href: '/search',
                                    text: 'Search',
                                    'aria-label': 'Search',
                                    icon: {
                                        svg: isUrlActive('/search') ? IconSearchActiveSvg : IconSearchSvg,
                                    },
                                },
                                {
                                    active: isUrlActive('/cart'),
                                    as: Link,
                                    className: 'breakpoint-smallOnly-hidden',
                                    href: '/cart',
                                    text: 'Bag',
                                    'aria-label': 'Bag',
                                    icon: {
                                        svg: isUrlActive('/cart') ? IconBagActiveSvg : IconBagSvg,
                                        count: cart?.totalQuantity || 0,
                                    },
                                },
                            ],
                        }}
                    />
                </HeaderContainer>

                <Main>{children}</Main>

                <FooterContainer as="footer">
                    <Footer
                        loading={queries.app.loading}
                        html={
                            footer?.items[0]?.html ? (
                                <PageBuilder html={footer.items[0].html} />
                            ) : (
                                <Copyright>{store?.copyright}</Copyright>
                            )
                        }
                    />
                </FooterContainer>

                <TabBarContainer as="nav">
                    <TabBar
                        items={[
                            {
                                active: isUrlActive('/'),
                                as: Link,
                                href: '/',
                                text: 'Home',
                                'aria-label': 'Home',
                                icon: {
                                    svg: isUrlActive('/') ? IconHomeActiveSvg : IconHomeSvg,
                                },
                            },
                            {
                                active: isUrlActive('/search'),
                                as: Link,
                                href: '/search',
                                text: 'Search',
                                'aria-label': 'Search',
                                icon: {
                                    svg: isUrlActive('/search') ? IconSearchActiveSvg : IconSearchSvg,
                                },
                            },
                            {
                                active: isUrlActive('/cart'),
                                as: Link,
                                href: '/cart',
                                text: 'Bag',
                                'aria-label': 'Bag',
                                icon: {
                                    svg: isUrlActive('/cart') ? IconBagActiveSvg : IconBagSvg,
                                    count: cart?.totalQuantity || 0,
                                },
                            },
                        ]}
                    />
                </TabBarContainer>
            </Root>
        </React.Fragment>
    )
}
