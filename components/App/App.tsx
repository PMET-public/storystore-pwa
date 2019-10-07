import React, { FunctionComponent, useCallback, useEffect } from 'react'
import APP_QUERY from './app.graphql'
import CREATE_CART_MUTATION from './createCart.graphql'
import { getTotalCartQuantity } from '../../lib/getTotalCartQuantity'

import { useQuery, useMutation } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { useAppContext } from 'luma-ui/dist/AppProvider'

import Link from '../Link'
import AppTemplate from 'luma-ui/dist/components/App'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'

export const App: FunctionComponent = ({ children }) => {
    const [appState, appDispatch] = useAppContext()

    const { error, loading, data } = useQuery(APP_QUERY, {
        fetchPolicy: 'cache-first',
        variables: { cartId: appState.cartId, withCart: !!appState.cartId },
    })

    const [createCart] = useMutation(CREATE_CART_MUTATION)

    useEffect(() => {
        if (!appState.cartId)
            createCart().then(res => {
                const { cartId = '' } = res.data
                appDispatch({ type: 'setCartId', payload: cartId })
            })
    }, [appState.cartId])

    useEffect(() => {
        if (data && data.cart)
            appDispatch({
                type: 'setCartCount',
                payload: getTotalCartQuantity(data.cart.items),
            })
    }, [data && data.cart && data.cart.items.length])

    const { route, query } = useRouter()

    const isUrlActive = useCallback(
        (href: string) => {
            return href === (query.url || route)
        },
        [query.url, route]
    )

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    const { store, categories, meta } = data

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
