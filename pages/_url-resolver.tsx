import React from 'react'
import dynamic from 'next/dynamic'
import { NextComponentType } from 'next'

import Link from '../components/Link'

const Error = dynamic(() => import('../components/Error'))
const Page = dynamic(() => import('../components/Page '))
const Category = dynamic(() => import('../components/Category'))
const Product = dynamic(() => import('../components/Product'))

const graphQLUrl = process.browser ? '/api/graphql' : process.env.MAGENTO_GRAPHQL_URL

export type ResolverProps = {
    contentId: number
    urlKey: string
    type: 'CMS_PAGE' | 'CATEGORY' | 'PRODUCT' | '404'
}

const UrlResolver: NextComponentType<any, any, ResolverProps> = ({ type, contentId, urlKey }) => {
    switch (type) {
        case 'CMS_PAGE':
            return <Page id={contentId} />
        case 'CATEGORY':
            return <Category id={contentId} />
        case 'PRODUCT':
            return <Product urlKey={urlKey} />
        case '404':
            return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
        default:
            return (
                <Error type="500" button={{ text: 'Reload', onClick: () => location.reload() }}>
                    `Internal Error: ${type} is not valid`
                </Error>
            )
    }
}

UrlResolver.getInitialProps = async ({ res, query }) => {
    const url = query.url ? query.url.toString().split('?')[0] : query['*']

    const urlKey =
        url
            .toString()
            .split('/')
            .pop() || ''

    if (query.type) {
        const type = query.type
        const contentId = Number(query.contentId)
        return { type, contentId, urlKey }
    }

    const graphQlQuery = `query%20%7B%0A%20%20urlResolver(url:%20"${url}")%20%7B%0A%20%20%20%20contentId:%20id%0A%20%20%20%20type%0A%20%20%7D%0A%7D`

    try {
        const page = await fetch(`${graphQLUrl}?query=${graphQlQuery}`)

        const { data = {} } = await page.json()

        const { type = '404', contentId } = data.urlResolver || {}

        if (type === '404') res.statusCode = 404

        return { type, contentId, urlKey }
    } catch (e) {
        res.statusCode = 500
    }
}

export default UrlResolver
