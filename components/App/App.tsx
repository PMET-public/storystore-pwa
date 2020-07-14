import React, { FunctionComponent, useEffect, useCallback, useState } from 'react'
import { ServerError } from 'apollo-link-http-common'
import dynamic from 'next/dynamic'
import { version } from '~/package.json'
import ReactGA from 'react-ga'
import Router from 'next/router'

import { ThemeProvider } from 'styled-components'
import { baseTheme, UIBase } from '@storystore/ui/dist/theme'
import { Root, HeaderContainer, Main, FooterContainer, Copyright, TabBarContainer, OfflineToast, HamburgerButton } from './App.styled'

import useServiceWorker from '~/hooks/useServiceWorker'
import { useRouter } from 'next/router'
import { AppProps } from './useApp'
import { useCart } from '../Cart'
import { resolveImage } from '~/lib/resolveImage'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'
import useNetworkStatus from '~/hooks/useNetworkStatus'
import useValueUpdated from '~/hooks/useValueUpdated'
import { useQuery } from '@apollo/react-hooks'

import { ToastsStyles } from './ToastsStyles'
import { FontStyles } from '~/components/App/FontStyles'

import NextNprogress from 'nextjs-progressbar'
import Head from '~/components/Head'
import Link from '~/components/Link'
import Header from '@storystore/ui/dist/components/Header'
import TabBar from '@storystore/ui/dist/components/TabBar'
import MobileMenuNav from '@storystore/ui/dist/components/MobileMenuNav'
import { generateColorTheme } from '@storystore/ui/dist/theme/colors'

import IconSearchSvg from 'remixicon/icons/System/search-line.svg'
import IconSearchActiveSvg from 'remixicon/icons/System/search-fill.svg'
import IconBagSvg from 'remixicon/icons/Finance/shopping-bag-line.svg'
import IconBagActiveSvg from 'remixicon/icons/Finance/shopping-bag-fill.svg'
import IconHomeSvg from 'remixicon/icons/Buildings/store-2-line.svg'
import IconHomeActiveSvg from 'remixicon/icons/Buildings/store-2-fill.svg'
import CloudOff from 'remixicon/icons/Business/cloud-off-line.svg'
import MenuSVG from 'remixicon/icons/System/menu-line.svg'
import CloseSVG from 'remixicon/icons/System/close-line.svg'

import FOOTER_QUERY from './graphql/footer.graphql'
import { queryDefaultOptions } from '~/lib/apollo/client'

const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'), { ssr: false })
const Footer = dynamic(() => import('@storystore/ui/dist/components/Footer'), { ssr: false })

const toast = process.browser ? require('react-toastify').toast : {}

if (process.browser) {
    const toast = require('react-toastify').toast

    toast.configure({
        position: toast.POSITION.BOTTOM_RIGHT,
    })
}

export const App: FunctionComponent<AppProps> = ({ loading, error, data, children }) => {
    const workbox = useServiceWorker()

    const { cartId, settings, setCartId } = useStoryStore()

    const cart = useCart({ cartId })

    const online = useNetworkStatus()

    const router = useRouter()

    const [showMenu, setShowMenu] = useState(false)

    const handleToggleMenu = useCallback(() => {
        setShowMenu(!showMenu)
    }, [showMenu, setShowMenu])

    const isUrlActive = useCallback(
        (_pathname: string): boolean => {
            const { pathname, asPath } = router || {}
            return _pathname === (asPath || pathname).split('?')[0]
        },
        [router]
    )

    /**
     * Footer
     */
    const footer = useQuery(FOOTER_QUERY, {
        ...queryDefaultOptions,
        variables: { footerBlockId: settings.footerBlockId },
        skip: !settings.footerBlockId,
    })

    /**
     * No Cart no problem. Let's create one
     */
    useEffect(() => {
        if (cart.loading || cart.api.creatingCart.loading || !!cart.api.creatingCart.data?.cartId) return

        if (cart.error || !cartId || cart.data?.cart?.id !== cartId) {
            if (process.env.NODE_ENV !== 'production') console.log('🛒 Creating new Cart')
            cart.api.createCart().then(setCartId)
        }
    }, [cart, cartId, setCartId])

    /**
     * Google Analytics
     */
    useEffect(() => {
        if (process.env.GOOGLE_ANALYTICS) {
            ReactGA.initialize(process.env.GOOGLE_ANALYTICS)
        }
    }, [])

    useEffect(() => {
        if (process.env.GOOGLE_ANALYTICS) {
            ReactGA.set({ dimension1: version }) // version

            ReactGA.set({ dimension2: window.location.host }) // release

            if (settings.magentoUrl) {
                ReactGA.set({ dimension3: new URL(settings.magentoUrl).host }) // endpoint
            }

            ReactGA.pageview(window.location.pathname)
        }
    }, [settings])

    /**
     * Handle Route changes
     */
    const handleRouteChange = useCallback(
        (url, error?: any) => {
            if (error) return

            workbox?.messageSW({
                type: 'CACHE_URLS',
                payload: {
                    urlsToCache: [url],
                },
            })

            if (process.env.GOOGLE_ANALYTICS) {
                ReactGA.pageview(url)
            }
        },
        [workbox]
    )

    useEffect(() => {
        Router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [handleRouteChange])

    /**
     * Offline Message
     */
    useValueUpdated(() => {
        if (!online) {
            toast.info(
                <OfflineToast>
                    <CloudOff />
                    Looks like you lost your connection.
                </OfflineToast>,
                {
                    toastId: 'offline',
                    autoClose: false,
                }
            )
        } else {
            toast.dismiss('offline')
        }
    }, online)

    if (online && error) {
        const networkError = error?.networkError as ServerError

        if (networkError?.statusCode === 401 || networkError?.statusCode === 403) {
            return (
                <Error type="401" button={{ text: 'Login', onClick: () => (window.location.href = '/basic-auth') }} fullScreen>
                    Authorization Required
                </Error>
            )
        }
    }

    const { store, categories = [] } = data || {}

    const categoryUrlSuffix = store?.categoryUrlSuffix ?? ''

    return (
        <ThemeProvider
            theme={{
                ...baseTheme,
                colors: {
                    ...baseTheme.colors,
                    ...generateColorTheme({
                        accent: settings.colorAccent || baseTheme.colors.accent,
                        onAccent: settings.colorOnAccent || baseTheme.colors.onAccent,
                        primary: settings.colorPrimary || baseTheme.colors.primary,
                        onPrimary: settings.colorOnPrimary || baseTheme.colors.onPrimary,
                        secondary: settings.colorSecondary || baseTheme.colors.secondary,
                        onSecondary: settings.colorOnSecondary || baseTheme.colors.onSecondary,
                        ...(settings.colorDark && {
                            surface: '#222222',
                            onSurface: '#ffffff',
                        }),
                    }),
                },
            }}
        >
            <NextNprogress color={settings.colorAccent || baseTheme.colors.accent} startPosition={0.4} stopDelayMs={200} height={3} options={{ showSpinner: false, easing: 'ease' }} />
            <UIBase />
            <FontStyles />
            <ToastsStyles />

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
                        loading={loading && !store}
                        logo={{
                            as: Link,
                            image: store?.logoSrc && {
                                src: resolveImage(store.baseMediaUrl + 'logo/' + store.logoSrc),
                                alt: store?.logoAlt || 'StoryStore PWA',
                            },
                            href: '/',
                            title: store?.logoAlt || 'StoryStore PWA',
                        }}
                        menu={{
                            items: categories[0]?.children?.map(({ id, text, href: _href, mode }: any) => {
                                const href = _href + categoryUrlSuffix

                                return {
                                    active: isUrlActive('/' + href),
                                    as: Link,
                                    urlResolver: {
                                        type: 'CATEGORY',
                                        id,
                                        mode,
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
                                        count: cart.data?.cart.totalQuantity || 0,
                                    },
                                },
                                {
                                    as: HamburgerButton,
                                    className: 'breakpoint-medium-hidden',
                                    onClick: handleToggleMenu,
                                    text: 'Menu',
                                    'aria-label': 'Menu',
                                    icon: {
                                        svg: showMenu ? CloseSVG : MenuSVG,
                                    },
                                },
                            ],
                        }}
                    />
                </HeaderContainer>

                <Main>{children}</Main>

                <FooterContainer as="footer">
                    <Footer
                        loading={footer.loading && !footer.data}
                        html={footer.data?.cmsBlocks.items[0]?.html ? <PageBuilder html={footer.data.cmsBlocks.items[0].html} /> : <Copyright>{store?.copyright}</Copyright>}
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
                                    count: cart.data?.cart.totalQuantity || 0,
                                },
                            },
                        ]}
                    />
                </TabBarContainer>
            </Root>

            <MobileMenuNav
                active={showMenu}
                onClose={handleToggleMenu}
                categories={{
                    title: 'Shop by Category',
                    items: categories[0]?.children?.map(({ id, text, href: _href, mode, image }: any) => {
                        const href = _href + categoryUrlSuffix

                        return {
                            as: Link,
                            urlResolver: {
                                type: 'CATEGORY',
                                id,
                                mode,
                            },
                            image: image && {
                                alt: text,
                                src: resolveImage(image, { width: 200, height: 200 }),
                                width: '100px',
                                height: '100px',
                            },
                            href: '/' + href,
                            text,
                        }
                    }),
                }}
                ctas={[
                    {
                        text: 'Sign in',
                        disabled: true,
                    },
                ]}
                style={{ position: 'absolute', zIndex: 10, right: 0, top: '1rem' }}
                className="breakpoint-medium-hidden"
            />
        </ThemeProvider>
    )
}
