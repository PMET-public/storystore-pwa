import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'

import Link from '../Link'
import AppTemplate from 'luma-storybook/dist/templates/App'
import ViewLoader from 'luma-storybook/dist/components/ViewLoader'
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

    const {
       store,
       categories,
       meta,
    } = data 

    const { query: { url } } = useRouter()

    const isUrlActive = (href: string) => url === href ? true : undefined
    
    return (
        <React.Fragment>
            <DocumentMetadata {...meta} />
            <AppTemplate
                logo={{ 
                    as: Link, 
                    href: '/' + store.homePath,
                    title: store.logoAlt,
                }}

                home={{
                    active: isUrlActive(store.homePath),
                    as: Link,
                    href: '/' + store.homePath,
                    text: 'Home',
                }}

                menu={categories.children.map(({ text, href }: any) => ({
                    as: Link,
                    text,
                    href: '/' + href,
                }))}

                help={{
                    as: Link,
                    href: '/customer-service',
                    text: 'Help',
                    active: isUrlActive('/customer-service'),
                }}

                myAccount={{
                    // as: Link,
                    // href: '/account',
                    text: 'My Account',
                    active: isUrlActive('/account'),
                }}

                search={{
                    // as: Link,
                    // href: '/search',
                    text: 'Search',
                    // active: isUrlActive('/search'),
                }}

                cart={{
                    // as: Link,
                    // href: '/cart',
                    text: 'My Bag',
                    // active: isUrlActive('/cart'),
                }}

                footer={{
                    copyright: store.copyright,
                    menu: [
                        { text: 'About', as: Link, href: '/about-us' },
                        { text: 'Customer Service', as: Link, href: '/customer-service' },
                        { text: 'Privacy Policy', as: Link, href: '/privacy-policy-cookie-restriction-mode' },
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
