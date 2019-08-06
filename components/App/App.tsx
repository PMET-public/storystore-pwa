import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'

import DocumentMetadata from '../DocumentMetadata'
import Link from '../Link'
import AppTemplate from 'luma-storybook/dist/templates/App'
import ViewLoader from 'luma-storybook/dist/components/ViewLoader'

const APP_SHELL_QUERY = gql`
    query AppShellQuery {
        storeConfig {
            logo_alt
            default_description
            default_keywords
            default_title
            title_prefix
            title_suffix
            cms_home_page
            copyright
        }

        category(id: 2) {
            children {
                name
                url_path
            }
        }
    }
`

export const App: FunctionComponent = ({ children }) => {
    const { loading, data } = useQuery<any>(APP_SHELL_QUERY, { fetchPolicy: 'cache-first' })

    if (loading) return <ViewLoader />

    const {
        storeConfig: {
            logo_alt,
            title_prefix,
            title_suffix,
            default_title,
            default_description,
            default_keywords,
            cms_home_page,
            copyright,
        },
        category: {
            children: categories,
        },

    } = data 

    const { query: { url } } = useRouter()

    const isUrlActive = (href: string) => url === href || undefined
    
    return (
        <React.Fragment>
            <DocumentMetadata
                title={[title_prefix, default_title, title_suffix]}
                description={default_description}
                keywords={default_keywords}
            />

            <AppTemplate
                logo={{
                    as: Link,
                    href: cms_home_page,
                    title: logo_alt,
                }}

                home={{
                    as: Link,
                    href: cms_home_page,
                    text: 'Home',
                    active: isUrlActive(cms_home_page),
                }}

                menu={categories.map(({
                    name,
                    url_path,                    
                }: any) => ({
                    text: name,
                    as: Link,
                    href:  url_path + '.html',
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
                    copyright,
                    // menu: [
                    //     { text: 'About', as: Link, href: '/about-us' },
                    //     { text: 'Customer Service', as: Link, href: '/customer-service' },
                    //     { text: 'Privacy Policy', as: Link, href: '/privacy-policy-cookie-restriction-mode' },
                    // ],
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
