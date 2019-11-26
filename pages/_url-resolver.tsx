import React from 'react'
import { graphQlUri } from '../apollo/client'
import { NextComponentType } from 'next'
import dynamic from 'next/dynamic'
import Link from '../components/Link'

const Error = dynamic(() => import('../components/Error'))
const Page = dynamic(() => import('../components/Page '))
const Category = dynamic(() => import('../components/Category'))
const Product = dynamic(() => import('../components/Product'))

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

UrlResolver.getInitialProps = async ({ query }) => {
    const [url] = query.url.toString().split('?')

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

    const res = await fetch(`${graphQlUri}?query=${graphQlQuery}`)

    const { data = {} } = await res.json()

    const { type = '404', contentId } = data.urlResolver || {}

    return { type, contentId, urlKey }
}

export default UrlResolver
