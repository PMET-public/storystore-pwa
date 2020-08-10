import React, { useMemo, FunctionComponent } from 'react'
import { NextPage } from 'next'
import { gql, useQuery } from '@apollo/client'
import { initializeApollo } from '~/lib/apollo/client'
import Link from '~/components/Link'
import Error from '~/components/Error'
import { APP_QUERY } from '~/components/App'
import PageComponent, { PAGE_QUERY } from '~/components/Page'
import CategoryComponent, { CATEGORY_QUERY } from '~/components/Category'
import ProductComponent, { PRODUCT_QUERY } from '~/components/Product'

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
    const page = useQuery(PAGE_QUERY, {
        variables: { id },
    })

    return <PageComponent {...page} />
}

const Category: FunctionComponent<{ id: number }> = ({ id }) => {
    const category = useQuery(CATEGORY_QUERY, {
        variables: { id: id.toString() },
    })

    return <CategoryComponent {...category} />
}

const Product: FunctionComponent<{ urlKey: string }> = ({ urlKey }) => {
    const product = useQuery(PRODUCT_QUERY, {
        variables: { urlKey },
    })

    return <ProductComponent {...product} />
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
    }, [type, urlKey, props])

    return renderPage
}

UrlResolver.getInitialProps = async ({ req, res, query, asPath }) => {
    if (!Boolean(process.env.CLOUD_MODE)) {
        res?.setHeader('cache-control', 's-maxage=1, stale-while-revalidate')
    }

    const apolloClient = initializeApollo(null, req?.headers.cookie)

    const pathname = asPath?.split('?')[0]

    const urlKey = pathname?.split('/').pop()?.split('.')?.shift() || ''

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
                await apolloClient.query({ query: CATEGORY_QUERY, variables: { id: id.toString() } })
                break
            case CONTENT_TYPE.PRODUCT:
                await apolloClient.query({ query: PRODUCT_QUERY, variables: { urlKey } })
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
