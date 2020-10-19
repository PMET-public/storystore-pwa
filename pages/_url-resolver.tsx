import React, { useMemo } from 'react'
import { NextPage } from 'next'
import { gql } from '@apollo/client'
import { initializeApollo } from '~/lib/apollo/client'
import Link from '~/components/Link'
import Error from '~/components/Error'
import { APP_QUERY } from '~/components/App'
import Page, { PAGE_QUERY } from '~/components/Page'
import Category, { CATEGORY_QUERY } from '~/components/Category'
import Product, { PRODUCT_QUERY } from '~/components/Product'
import { PRODUCTS_QUERY } from '~/components/Products'

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

const UrlResolver: NextPage<ResolverProps> = ({ type, urlKey, ...props }) => {
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
                return <Product key={urlKey} urlKey={urlKey} {...props} />
            case CONTENT_TYPE.NOT_FOUND:
                return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
            default:
                return (
                    <Error type="500" button={{ text: 'Reload', onClick: () => window.location.reload() }}>
                        Internal Error: {type} is not valid
                    </Error>
                )
        }
    }, [type, urlKey, props])

    return renderPage
}

UrlResolver.getInitialProps = async ({ req, res, query }) => {
    if (Boolean(process.env.CLOUD_MODE) === false) {
        res?.setHeader('cache-control', 's-maxage=1, stale-while-revalidate')
    }

    const apolloClient = initializeApollo(null, req?.headers.cookie)

    const _pathname = query.pathname as Array<any>

    const pathname = _pathname.join('/')

    const urlKey = _pathname[_pathname.length - 1].split('.')[0]

    if (query.type) {
        return {
            ...query,
            type: String(query.type),
            urlKey,
        }
    }

    /**
     * Resolver URL
     */
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
     * URL not-found. Return 404
     */
    if (!data?.urlResolver) {
        if (res) res.statusCode = 404
        return {
            type: '404',
            pathname,
        }
    }

    /**
     * If SSR, load data in cache
     */
    if (!!req) {
        const { type, id } = data.urlResolver

        await apolloClient.query({ query: APP_QUERY }) // Preload App Data

        switch (type) {
            case CONTENT_TYPE.CMS_PAGE:
                await apolloClient.query({ query: PAGE_QUERY, variables: { id } })
                break
            case CONTENT_TYPE.CATEGORY:
                const { data } = await apolloClient.query({ query: CATEGORY_QUERY, variables: { id: id } })

                if (/PRODUCTS/.test(data?.categoryList[0]?.mode)) {
                    await apolloClient.query({ query: PRODUCTS_QUERY, variables: { filters: { category_id: { eq: id.toString() } } } })
                }
                break
            case CONTENT_TYPE.PRODUCT:
                await apolloClient.query({ query: PRODUCT_QUERY, variables: { filters: { url_key: { eq: urlKey } } } })
                break
            default:
                break
        }
    }

    /**
     * Return Values
     */
    return {
        ...query,
        ...data.urlResolver,
        urlKey,
        initialState: apolloClient.cache.extract(),
    }
}

export default UrlResolver
