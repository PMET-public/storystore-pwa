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
    type: string
    contentId: number
    urlKey: string
}

const UrlResolver: NextPage<ResolverProps> = ({ type, contentId, urlKey }) => {
    const renderPage = useMemo(() => {
        if (!type) {
            return (
                <Error type="500" button={{ text: 'Reload', onClick: () => window.location.reload() }}>
                    Missing UrlResolver Type
                </Error>
            )
        }

        switch (type) {
            case 'CMS_PAGE':
                return <Page key={contentId} id={contentId} />
            case 'CATEGORY':
                return <Category key={contentId} id={contentId} />
            case 'PRODUCT':
                return <Product key={contentId} urlKey={urlKey} />
            case '404':
                return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
            default:
                return (
                    <Error type="500" button={{ text: 'Reload', onClick: () => window.location.reload() }}>
                        Internal Error: {type} is not valid
                    </Error>
                )
        }
    }, [type, contentId, urlKey])

    return <App>{renderPage}</App>
}

// enable next.js ssr
UrlResolver.getInitialProps = async ctx => {
    const { apolloClient }: { apolloClient: ApolloClient<NormalizedCacheObject> } = initOnContext(ctx)

    const { res, query } = ctx

    if (!Boolean(process.env.DEMO_MODE)) {
        res?.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    }

    const { type, contentId } = query

    const url = query.url ? query.url.toString().split('?')[0] : (query[''] as string[]).join('/')

    const urlKey = url.split('/').pop()?.split('.')[0] || ''

    if (type && (contentId || urlKey)) {
        return { type, contentId, urlKey }
    }

    const { data } = await apolloClient.query({
        query: gql`
            query UrlResolver($url: String!) {
                urlResolver(url: $url) {
                    id
                    type
                    contentId: id
                }
            }
        `,
        variables: {
            url,
        },
    })

    return {
        type: data.urlResolver.type,
        contentId: data.urlResolver.contentId,
        urlKey,
    }
}

export default withApollo(UrlResolver)
