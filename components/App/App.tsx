import React, { FunctionComponent, useCallback } from 'react'
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

    const isUrlActive = useCallback(
        (href: string) => {
            return href === (url || route)
        },
        [url, route]
    )

    return (
        <React.Fragment>
            <DocumentMetadata {...meta} />
            <AppTemplate
                logo={{
                    as: props => <Link urlResolver href="/" {...props} />,
                    title: store.logoAlt,
                }}
                home={{
                    as: props => <Link urlResolver href="/" {...props} />,
                    active: isUrlActive('/'),
                    text: 'Home',
                }}
                menu={categories.children.map(({ text, href }: any) => ({
                    as: (props: any) => <Link urlResolver href={'/' + href} {...props} />,
                    active: isUrlActive('/' + href),
                    text,
                }))}
                myAccount={{
                    text: 'My Account',
                }}
                favorites={{
                    text: 'Likes',
                }}
                search={{
                    as: props => <Link href="/search" {...props} />,
                    active: isUrlActive('/search'),
                    text: 'Search',
                }}
                cart={{
                    text: 'Bag',
                }}
                footer={{
                    copyright: store.copyright,
                    menu: [
                        { text: 'About', as: props => <Link urlResolver href="/about-us" {...props} /> },
                        {
                            text: 'Customer Service',
                            as: props => <Link urlResolver href="/customer-service" {...props} />,
                        },
                        {
                            text: 'Privacy Policy',
                            as: props => <Link urlResolver href="/privacy-policy-cookie-restriction-mode" {...props} />,
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
