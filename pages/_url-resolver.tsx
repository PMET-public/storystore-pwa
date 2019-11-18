import React, { useMemo } from 'react'
import { graphQlUri } from '../apollo/client'
import { NextComponentType } from 'next'
import dynamic from 'next/dynamic'

const Error = dynamic(() => import('../components/Error'))
const Page = dynamic(() => import('../components/Page '))
const Category = dynamic(() => import('../components/Category'))
const Product = dynamic(() => import('../components/Product'))

export type ResolverProps = {
    contentId: number
    url: string
    type: 'CMS_PAGE' | 'CATEGORY' | 'PRODUCT'
}

const UrlResolver: NextComponentType<any, any, ResolverProps> = ({ contentId, type, url }) => {
    const urlKey = useMemo(
        () =>
            url
                .toString()
                .split('/')
                .pop() || '',
        [url]
    )

    switch (type) {
        case 'CMS_PAGE':
            return <Page id={contentId} />
        case 'CATEGORY':
            return <Category id={contentId} />
        case 'PRODUCT':
            return <Product urlKey={urlKey} />
        default:
            return <Error type="500">`Internal Error: ${type} is not valid`</Error>
    }
}

UrlResolver.getInitialProps = async ({ query }) => {
    const [url] = query.url.toString().split('?')
    const type = query.type

    if (type) {
        const contentId = Number(query.contentId)
        return { url, type, contentId }
    }

    const graphQlQuery = `query%20%7B%0A%20%20urlResolver(url:%20"${url}")%20%7B%0A%20%20%20%20contentId:%20id%0A%20%20%20%20type%0A%20%20%7D%0A%7D&variables=%7B"id":20,"categoryId":2%7D`

    const res = await fetch(`${graphQlUri}?query=${graphQlQuery}`)

    const {
        data: { urlResolver },
    } = await res.json()

    return {
        url,
        type: urlResolver.type,
        contentId: urlResolver.contentId,
    }
}

export default UrlResolver
