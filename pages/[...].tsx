import React, { useMemo } from 'react'
import { withApollo } from '~/lib/apollo/withApollo'
import { NextPage } from 'next'
import { initOnContext } from '~/lib/apollo/withApollo'
import gql from 'graphql-tag'

import App from '~/components/App'
import Link from '~/components/Link'
import Error from '~/components/Error'
import Page from '~/components/Page '
import Category from '~/components/Category'
import Product from '~/components/Product'
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
    url: string
    [key: string]: any
}

const UrlResolver: NextPage<ResolverProps> = ({ type, url, ...props }) => {
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
                return <Page {...props} key={props.id} id={props.id} />
            case CONTENT_TYPE.CATEGORY:
                return <Category {...props} key={props.id} id={props.id} />
            case CONTENT_TYPE.PRODUCT:
                const urlKey = props.urlKey || url.split('/').pop()?.split('.')[0] || ''
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
    }, [type, url, props])

    return <App>{renderPage}</App>
}

// enable next.js ssr
UrlResolver.getInitialProps = async ctx => {
    const { apolloClient }: { apolloClient: ApolloClient<NormalizedCacheObject> } = initOnContext(ctx)

    const { res, query } = ctx

    const { type, url: _url, ...rest } = query

    if (!Boolean(process.env.DEMO_MODE)) {
        res?.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    }

    const url = _url ? _url.toString().split('?')[0] : (query[''] as string[]).join('/')

    if (type) {
        return {
            type: String(type),
            url,
            ...rest,
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
            url,
        },
    })

    /**
     * Url not-found. Return 404
     */
    if (!data?.urlResolver) {
        if (res) res.statusCode = 404
        return {
            type: '404',
            url,
        }
    }

    /**
     * Return Values
     */
    return {
        url,
        ...data.urlResolver,
        ...rest,
    }
}

export default withApollo(UrlResolver)
