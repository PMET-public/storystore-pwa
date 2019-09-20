import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'

import Link from '../Link'
import AppTemplate from 'luma-ui/dist/components/App'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'

const APP_SHELL_QUERY = gql`
    query AppShellQuery {
        store: storeConfig {
            id
            logoAlt: logo_alt
            homePath: cms_home_page
            copyright
        }

        categories: category(id: 2) {
            id
            children {
                text: name
                href: url_path
            }
        }

        meta: storeConfig {
            id
            title: default_title
            titlePrefix: title_prefix
            titleSuffix: title_suffix
            description: default_description
            keywords: default_keywords
        }
    }
`

export const App: FunctionComponent = ({ children }) => {
    const { loading, error, data } = useQuery<any>(APP_SHELL_QUERY, { fetchPolicy: 'cache-first' })

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    const { store, categories, meta } = data

    const {
        route,
        query: { url },
    } = useRouter()

    const isUrlActive = (href: string) => {
        return href === (url || route)
    }

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
                    // active: isUrlActive('/cart'),
                    // as: Link,
                    // href: '/cart',
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
