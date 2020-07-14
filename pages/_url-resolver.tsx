import React, { useMemo, FunctionComponent } from 'react'
import { withApollo, initOnContext } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'
import { NextPage } from 'next'
import gql from 'graphql-tag'

import Link from '~/components/Link'
import Error from '~/components/Error'
import PageComponent, { usePage } from '~/components/Page '
import CategoryComponent, { useCategory } from '~/components/Category'
import ProductComponent, { useProduct } from '~/components/Product'
import ApolloClient from 'apollo-client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'

export enum CONTENT_TYPE {
    CMS_PAGE = 'CMS_PAGE',
    CATEGORY = 'CATEGORY',
    PRODUCT = 'PRODUCT',
    NOT_FOUND = '404',
}

export type ResolverProps = {
    type: CONTENT_TYPE
    pathname: string
    [key: string]: any
}

const Page: FunctionComponent<{ id: number }> = ({ id }) => {
    const page = usePage({ id })
    return <PageComponent {...page} />
}

const Category: FunctionComponent<{ id: number }> = ({ id }) => {
    const category = useCategory({ id })
    return <CategoryComponent {...category} id={id} />
}

const Product: FunctionComponent<{ urlKey: string }> = ({ urlKey }) => {
    const product = useProduct({ urlKey })
    return <ProductComponent {...product} />
}

const UrlResolver: NextPage<ResolverProps> = ({ type, pathname, ...props }) => {
    const renderPage = useMemo(() => {
        if (!type) {
            return (
                <Error type="500" button={{ text: 'Reload', onClick: () => window.location.reload() }}>
                    Missing UrlResolver Type
                </Error>
            )
        }

        switch (type) {
            case CONTENT_TYPE.CMS_PAGE:
                return <Page key={props.id} id={props.id} />
            case CONTENT_TYPE.CATEGORY:
                return <Category {...props} key={props.id} id={props.id} />
            case CONTENT_TYPE.PRODUCT:
                const urlKey = pathname.split('/').pop()?.split('.')?.shift() || ''
                return <Product {...props} key={urlKey} urlKey={urlKey} />
            case CONTENT_TYPE.NOT_FOUND:
                return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
            default:
                return (
                    <Error type="500" button={{ text: 'Reload', onClick: () => window.location.reload() }}>
                        Internal Error: {type} is not valid
                    </Error>
                )
        }
    }, [type, pathname, props])

    return renderPage
}

// enable next.js ssr
UrlResolver.getInitialProps = async ctx => {
    const { apolloClient }: { apolloClient: ApolloClient<NormalizedCacheObject> } = initOnContext(ctx)

    const { res, query, asPath } = ctx

    const { type, ...params } = query

    const pathname = asPath?.split('?')[0]

    if (type) {
        return {
            ...params,
            type: String(type),
            pathname,
        }
    }

    const { data } = await apolloClient.query({
        query: gql`
            query UrlResolver($url: String!) {
                urlResolver(url: $url) {
                    id
                    type
                }
            }
        `,
        variables: {
            url: pathname,
        },
    })

    /**
     * Url not-found. Return 404
     */
    if (!data?.urlResolver) {
        if (res) res.statusCode = 404
        return {
            type: '404',
            pathname,
        }
    }

    /**
     * Return Values
     */
    return {
        includeAppData: true,
        ...data.urlResolver,
        ...params,
        pathname,
    }
}

export default withStoryStore(MyApp)
